package handlers

import (
	"bytes"
	"io"
	"net/http"
	"path/filepath"
	"time"

	"github.com/exply/armoire/internal/ai"
	"github.com/exply/armoire/internal/database"
	"github.com/exply/armoire/internal/models"
	"github.com/exply/armoire/internal/storage"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// @Summary Upload a clothing item
// @Description Upload a clothing item image, analyze it with AI for auto-tagging, generate vector embeddings, and store in database
// @Tags clothing
// @Accept multipart/form-data
// @Produce json
// @Security     BearerAuth
// @Param image formData file true "Clothing item image (max 10MB)"
// @Success 200 {object} models.ClothingItem "Successfully uploaded and processed clothing item"
// @Failure 400 {string} string "Invalid file"
// @Failure 500 {string} string "Failed to upload to GCS / AI Analysis Failed / Vector Embedding Failed / Database Save Failed"
// @Router /clothing/upload [post]
func UploadClothingHandler(c *gin.Context) {

	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}
	userID := userIDVal.(string) // Type assertion to string

	// 1. Parse the Multipart Form (10MB limit)
	c.Request.ParseMultipartForm(10 << 20)

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file"})
		return
	}
	defer file.Close()

	// Read the file data into memory for both GCS upload and AI analysis
	fileData, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
		return
	}

	// 2. Upload to Google Cloud Storage
	gcsClient, _ := storage.NewStorageClient("armoire-bucket")

	// Generate a unique filename
	filename := primitive.NewObjectID().Hex() + filepath.Ext(header.Filename)
	gcsURI, err := gcsClient.UploadFile(bytes.NewReader(fileData), filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload to GCS"})
		return
	}

	// Construct the public HTTP URL for the frontend to display
	publicURL := "https://storage.googleapis.com/armoire-bucket/" + filename

	// 3. Analyze with Gemini (Auto-Tagging)
	aiClient, _ := ai.NewAIClient(c.Request.Context()) // Initialize AI Client

	analysis, err := aiClient.AnalyzeImage(c.Request.Context(), bytes.NewReader(fileData))
	if err != nil {
		// Fallback: If AI fails, we can still save the image, just with empty tags
		// But for now, let's report the error
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI Analysis Failed: " + err.Error()})
		return
	}

	// 4. Generate Vector Embedding for "Vibe Search"
	// We embed the description Gemini just wrote for us
	vector, err := aiClient.GetEmbedding(c.Request.Context(), analysis.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Vector Embedding Failed"})
		return
	}

	// 5. Save to MongoDB
	newItem := models.ClothingItem{
		ID:          primitive.NewObjectID(),
		UserID:      userID,
		ImageURL:    publicURL,
		GCSURI:      gcsURI,
		Name:        analysis.Name,
		Category:    analysis.Category,
		Description: analysis.Description,
		Colors:      analysis.Colors,
		Seasons:     analysis.Seasons,
		Occasions:   analysis.Occasions,
		Embedding:   vector,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	collection := database.GetCollection("clothing")
	_, err = collection.InsertOne(c.Request.Context(), newItem)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database Save Failed"})
		return
	}

	// 6. Return Success Response
	c.JSON(http.StatusOK, newItem)
}
