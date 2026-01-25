package handlers

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"time"

	"github.com/exply/armoire/internal/ai"
	"github.com/exply/armoire/internal/database"
	"github.com/exply/armoire/internal/models"
	"github.com/exply/armoire/internal/storage"
	"github.com/exply/armoire/internal/taxonomy"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// Search Request Body
type SearchRequest struct {
	Query      string   `json:"query"`      // e.g. "Dinner date" or "Blue jacket"
	AISearch   bool     `json:"aiSearch"`   // Toggle between Regex match vs Vector Match
	Categories []string `json:"categories"` // Hard filter
	Colors     []string `json:"colors"`     // Hard filter
}

// @Summary Search clothing items
// @Description Search using keyword matching or AI-powered "vibe" search with filters
// @Tags clothing
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body handlers.SearchRequest true "Search parameters"
// @Success 200 {array} models.ClothingItem
// @Router /clothing/search [post]
func SearchClothingHandler(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}
	userID := userIDVal.(string)

	var req SearchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	collection := database.GetCollection("clothing")
	ctx := c.Request.Context()
	var results []models.ClothingItem

	if req.AISearch && req.Query != "" {
		// 1. Get Embedding for the query (e.g., "Sad rainy day outfit")
		aiClient, _ := ai.NewAIClient(ctx)
		queryVector, err := aiClient.GetEmbedding(ctx, req.Query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate search embedding"})
			return
		}

		// 2. Build Filter for Vector Search
		// Note: fields must be indexed as "filter" in Atlas
		filter := bson.M{"user_id": userID}

		if len(req.Categories) > 0 {
			filter["category"] = bson.M{"$in": req.Categories}
		}
		if len(req.Colors) > 0 {
			filter["colors"] = bson.M{"$in": req.Colors}
		}

		// 3. Build Aggregation Pipeline
		pipeline := mongo.Pipeline{
			{{Key: "$vectorSearch", Value: bson.D{
				{Key: "index", Value: "vector_index"},
				{Key: "path", Value: "embedding"},
				{Key: "queryVector", Value: queryVector},
				{Key: "numCandidates", Value: 100},
				{Key: "limit", Value: 20},
				{Key: "filter", Value: filter},
			}}},
			// Hide the embedding field to save bandwidth
			{{Key: "$project", Value: bson.D{{Key: "embedding", Value: 0}}}},
		}

		cursor, err := collection.Aggregate(ctx, pipeline)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed: " + err.Error()})
			return
		}
		if err = cursor.All(ctx, &results); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode results"})
			return
		}

	} else {

		filter := bson.M{"user_id": userID}

		// Text Search (Simple partial match on Name)
		if req.Query != "" {
			filter["name"] = bson.M{"$regex": primitive.Regex{Pattern: req.Query, Options: "i"}}
		}

		// Exact Filters
		if len(req.Categories) > 0 {
			filter["category"] = bson.M{"$in": req.Categories}
		}
		if len(req.Colors) > 0 {
			filter["colors"] = bson.M{"$in": req.Colors}
		}

		cursor, err := collection.Find(ctx, filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed"})
			return
		}
		if err = cursor.All(ctx, &results); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode results"})
			return
		}
	}

	// Return empty array instead of null if no results
	if results == nil {
		results = []models.ClothingItem{}
	}

	c.JSON(http.StatusOK, results)
}

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

	// 1. Parse File
	fileHeader, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file"})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}

	defer file.Close()

	// Read into memory
	originalBytes, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
		return
	}

	finalBytes := originalBytes
	finalMimeType := http.DetectContentType(originalBytes)
	baseName := primitive.NewObjectID().Hex()
	finalFilename := baseName + filepath.Ext(fileHeader.Filename)

	processedBytes, err := ai.RemoveBackground(originalBytes, fileHeader.Filename)

	fmt.Println("e")

	if err == nil {
		fmt.Println("Background removed successfully!")
		finalBytes = processedBytes
		finalMimeType = "image/png"
		finalFilename = baseName + ".png" // Force extension to .png
	} else {
		fmt.Println("Background removal failed (using original):", err)
	}

	gcsClient, _ := storage.NewStorageClient("armoire-bucket")

	// Pass finalBytes to GCS
	gcsURI, err := gcsClient.UploadFile(bytes.NewReader(finalBytes), finalFilename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload to GCS"})
		return
	}
	publicURL := "https://storage.googleapis.com/armoire-bucket/" + finalFilename

	// 3. Analyze with Gemini (Auto-Tagging)
	aiClient, _ := ai.NewAIClient(c.Request.Context()) // Initialize AI Client

	analysis, err := aiClient.AnalyzeImage(c.Request.Context(), bytes.NewReader(finalBytes), finalMimeType)
	if err != nil {
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

// UserStatsResponse represents the statistics for a user's clothing collection
type UserStatsResponse struct {
	TotalItems     int            `json:"totalItems"`
	ColorCounts    map[string]int `json:"colorCounts"`
	CategoryCounts map[string]int `json:"categoryCounts"`
}

// @Summary Get user clothing statistics
// @Description Get statistics about a user's clothing collection including total count, color distribution, and category distribution
// @Tags clothing
// @Produce json
// @Security BearerAuth
// @Success 200 {object} handlers.UserStatsResponse
// @Router /clothing/stats [get]
func GetUserStatsHandler(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}
	userID := userIDVal.(string)

	collection := database.GetCollection("clothing")
	ctx := c.Request.Context()

	// Get all clothing items for the user
	filter := bson.M{"user_id": userID}
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch clothing items"})
		return
	}
	defer cursor.Close(ctx)

	var items []models.ClothingItem
	if err = cursor.All(ctx, &items); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode clothing items"})
		return
	}

	// Initialize maps with all possible colors and categories from taxonomy
	colorCounts := make(map[string]int)
	for _, color := range taxonomy.Colors {
		colorCounts[color] = 0
	}

	categoryCounts := make(map[string]int)
	for _, category := range taxonomy.Categories {
		categoryCounts[category] = 0
	}

	// Count occurrences
	for _, item := range items {
		// Count colors (an item can have multiple colors)
		for _, color := range item.Colors {
			if _, exists := colorCounts[color]; exists {
				colorCounts[color]++
			}
		}

		// Count category (an item has one category)
		if _, exists := categoryCounts[item.Category]; exists {
			categoryCounts[item.Category]++
		}
	}

	response := UserStatsResponse{
		TotalItems:     len(items),
		ColorCounts:    colorCounts,
		CategoryCounts: categoryCounts,
	}

	c.JSON(http.StatusOK, response)
}
