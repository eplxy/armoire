package handlers

import (
	"net/http"

	"github.com/exply/armoire/internal/ai"
	"github.com/exply/armoire/internal/database"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// @Summary Get Stylist Message
// @Description Get a personalized AI message based on closet stats
// @Tags dashboard
// @Security BearerAuth
// @Produce json
// @Success 200 {object} gin.H
// @Router /dashboard/stylist [get]
func GetStylistMessageHandler(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(string)

	// 1. Aggregate Data (Count items by Color and Category)
	// We run two simple aggregations to get the "Shape" of the closet
	collection := database.GetCollection("clothing")
	ctx := c.Request.Context()

	// Helper to count field
	countField := func(field string) map[string]int {
		pipeline := mongo.Pipeline{
			{{Key: "$match", Value: bson.D{{Key: "user_id", Value: userID}}}},
			{{Key: "$unwind", Value: "$" + field}}, // Unwind arrays like colors
			{{Key: "$group", Value: bson.D{
				{Key: "_id", Value: "$" + field},
				{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
			}}},
			{{Key: "$sort", Value: bson.D{{Key: "count", Value: -1}}}}, // Top items first
			{{Key: "$limit", Value: 5}},                                // Only take top 5 to save tokens
		}

		cursor, _ := collection.Aggregate(ctx, pipeline)
		var results []bson.M
		cursor.All(ctx, &results)

		counts := make(map[string]int)
		for _, res := range results {
			name, _ := res["_id"].(string)
			count, _ := res["count"].(int32)
			counts[name] = int(count)
		}
		return counts
	}

	topColors := countField("colors")
	topCategories := countField("category")

	// 2. Prepare Data for AI
	stats := map[string]interface{}{
		"Top Colors":     topColors,
		"Top Categories": topCategories,
	}

	// 3. Call Gemini
	aiClient, _ := ai.NewAIClient(ctx)
	message, err := aiClient.GenerateStylistBlurb(ctx, stats)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Stylist is on coffee break"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": message,
		"stats":   stats, // Useful if you want to verify what AI saw
	})
}
