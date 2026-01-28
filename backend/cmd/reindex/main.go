package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/genai"
)

// Minimal struct to read just what we need
type ClothingDoc struct {
	ID          primitive.ObjectID `bson:"_id"`
	Description string             `bson:"description"`
	Name        string             `bson:"name"`
}

func main() {
	// 1. Load Environment Variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found")
	}

	ctx := context.Background()
	mongoURI := os.Getenv("MONGO_URI")
	apiKey := os.Getenv("GEMINI_API_KEY")

	if mongoURI == "" || apiKey == "" {
		log.Fatal("Missing MONGO_URI or GEMINI_API_KEY environment variables")
	}

	// 2. Connect to MongoDB
	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal(err)
	}
	defer mongoClient.Disconnect(ctx)

	collection := mongoClient.Database("armoire-db").Collection("clothing")

	// 3. Connect to Gemini (New SDK)
	aiClient, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Fatal(err)
	}

	// 4. Find all documents
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(ctx)

	fmt.Println("🚀 Starting Re-Indexing Process...")

	count := 0
	success := 0

	// 5. Iterate through every document
	for cursor.Next(ctx) {
		var item ClothingDoc
		if err := cursor.Decode(&item); err != nil {
			log.Printf("Error decoding doc: %v\n", err)
			continue
		}

		count++
		fmt.Printf("[%d] Processing: %s... ", count, item.Name)

		if item.Description == "" {
			fmt.Println("SKIPPED (No description)")
			continue
		}

		// 6. Generate NEW Embedding
		// We use the exact model you are now using in your app
		resp, err := aiClient.Models.EmbedContent(ctx, "gemini-embedding-001", genai.Text(item.Description), nil)

		if err != nil {
			fmt.Printf("FAILED (AI Error: %v)\n", err)
			// Optional: Add a retry logic here if needed
			continue
		}

		if len(resp.Embeddings) == 0 {
			fmt.Printf("FAILED (Empty embedding)\n")
			continue
		}

		newVector := resp.Embeddings[0].Values

		// 7. Update MongoDB
		update := bson.M{
			"$set": bson.M{
				"embedding":  newVector,
				"updated_at": time.Now(),
			},
		}

		_, err = collection.UpdateOne(ctx, bson.M{"_id": item.ID}, update)
		if err != nil {
			fmt.Printf("FAILED (DB Error: %v)\n", err)
		} else {
			fmt.Println("DONE ✅")
			success++
		}

		// 8. Rate Limiting (Crucial!)
		// Gemini has rate limits (RPM). A small sleep prevents 429 errors.
		time.Sleep(200 * time.Millisecond)
	}

	fmt.Printf("\n✨ Finished! Processed %d items. Successfully re-indexed %d.\n", count, success)
}
