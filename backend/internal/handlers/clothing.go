package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"path/filepath"
	"time"

	"github.com/exply/armoire/internal/ai"
	"github.com/exply/armoire/internal/database"
	"github.com/exply/armoire/internal/models"
	"github.com/exply/armoire/internal/storage"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// @Summary Upload a clothing item
// @Description Upload a clothing item image, analyze it with AI for auto-tagging, generate vector embeddings, and store in database
// @Tags clothing
// @Accept multipart/form-data
// @Produce json
// @Param image formData file true "Clothing item image (max 10MB)"
// @Success 200 {object} models.ClothingItem "Successfully uploaded and processed clothing item"
// @Failure 400 {string} string "Invalid file"
// @Failure 500 {string} string "Failed to upload to GCS / AI Analysis Failed / Vector Embedding Failed / Database Save Failed"
// @Router /clothing/upload [post]
func UploadClothingHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Parse the Multipart Form (10MB limit)
	r.ParseMultipartForm(10 << 20)

	file, header, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Invalid file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Read the file data into memory for both GCS upload and AI analysis
	fileData, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusInternalServerError)
		return
	}

	// 2. Upload to Google Cloud Storage
	gcsClient, _ := storage.NewStorageClient("armoire-bucket")

	// Generate a unique filename
	filename := primitive.NewObjectID().Hex() + filepath.Ext(header.Filename)
	gcsURI, err := gcsClient.UploadFile(bytes.NewReader(fileData), filename)
	if err != nil {
		http.Error(w, "Failed to upload to GCS", http.StatusInternalServerError)
		return
	}

	// Construct the public HTTP URL for the frontend to display
	publicURL := "https://storage.googleapis.com/armoire-bucket/" + filename

	// 3. Analyze with Gemini (Auto-Tagging)
	ctx := r.Context()
	aiClient, _ := ai.NewAIClient(ctx) // Initialize AI Client

	analysis, err := aiClient.AnalyzeImage(ctx, bytes.NewReader(fileData))
	if err != nil {
		// Fallback: If AI fails, we can still save the image, just with empty tags
		// But for now, let's report the error
		http.Error(w, "AI Analysis Failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 4. Generate Vector Embedding for "Vibe Search"
	// We embed the description Gemini just wrote for us
	vector, err := aiClient.GetEmbedding(ctx, analysis.Description)
	if err != nil {
		http.Error(w, "Vector Embedding Failed", http.StatusInternalServerError)
		return
	}

	// 5. Save to MongoDB
	newItem := models.ClothingItem{
		ID:          primitive.NewObjectID(),
		UserID:      "test-user-id", // TODO Replace with actual Auth User ID later
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

	collection := database.GetCollection("clothing_items")
	_, err = collection.InsertOne(ctx, newItem)
	if err != nil {
		http.Error(w, "Database Save Failed", http.StatusInternalServerError)
		return
	}

	// 6. Return Success Response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newItem)
}
