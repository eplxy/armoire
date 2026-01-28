package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/exply/armoire/internal/database"
	"github.com/exply/armoire/internal/imageproc" // Your resize logic
	"github.com/exply/armoire/internal/storage"   // Your GCS client
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Define a minimal struct for reading/writing
type ClothingItem struct {
	ID           primitive.ObjectID `bson:"_id"`
	ImageURL     string             `bson:"image_url"`
	ThumbnailURL string             `bson:"thumbnail_url"`
}

// yes this script was vibe coded
// hopefully never have to use it again

func main() {
	// 1. Load Env (Make sure .env is in your root or passed manually)
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found (checking system env)")
	}

	// 2. Connect to DB
	// (Assumes your database package has a Connect() function)
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("MONGO_URI is required")
	}
	// Re-use your internal DB connection logic if possible, or connect directly:
	database.InitDB(mongoURI)
	coll := database.GetCollection("clothing")

	// 3. Connect to GCS
	bucketName := "armoire-bucket"
	gcsClient, err := storage.NewStorageClient(bucketName)
	if err != nil {
		log.Fatal(err)
	}

	// 4. Find all items
	ctx := context.Background()
	cursor, err := coll.Find(ctx, bson.M{}) // Fetch ALL items
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(ctx)

	fmt.Println("🚀 Starting Thumbnail Migration...")

	successCount := 0
	skipCount := 0
	errCount := 0

	for cursor.Next(ctx) {
		var item ClothingItem
		if err := cursor.Decode(&item); err != nil {
			log.Printf("❌ Failed to decode item: %v\n", err)
			continue
		}

		// SKIP if already has a thumbnail (remove this check if you want to force regenerate)
		if item.ThumbnailURL != "" && !strings.Contains(item.ThumbnailURL, "placeholder") {
			fmt.Printf("⏭️  Skipping %s (Already has thumbnail)\n", item.ID.Hex())
			skipCount++
			continue
		}

		fmt.Printf("Processing %s ... ", item.ID.Hex())

		// A. Download Original Image
		resp, err := http.Get(item.ImageURL)
		if err != nil || resp.StatusCode != 200 {
			fmt.Printf("❌ Failed to download original: %v\n", err)
			errCount++
			continue
		}
		defer resp.Body.Close()

		originalBytes, _ := io.ReadAll(resp.Body)

		// B. Generate Thumbnail (300px)
		// Assuming imageproc.CreateThumbnail(bytes, width)
		thumbBytes, err := imageproc.CreateThumbnail(originalBytes, 300)
		if err != nil {
			fmt.Printf("❌ Resize failed: %v\n", err)
			errCount++
			continue
		}

		// C. Create Filename
		// Extract filename from URL or generate new one
		// e.g., https://storage.../abc.png -> abc_thumb.png
		baseName := filepath.Base(item.ImageURL)
		// Remove query params if any
		if idx := strings.Index(baseName, "?"); idx != -1 {
			baseName = baseName[:idx]
		}

		ext := filepath.Ext(baseName)
		nameWithoutExt := strings.TrimSuffix(baseName, ext)
		thumbFilename := nameWithoutExt + "_thumb" + ext

		// D. Upload to GCS
		_, err = gcsClient.UploadFile(bytes.NewReader(thumbBytes), thumbFilename)
		if err != nil {
			fmt.Printf("❌ Upload failed: %v\n", err)
			errCount++
			continue
		}

		// E. Update MongoDB
		newThumbURL := fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, thumbFilename)

		_, err = coll.UpdateOne(ctx,
			bson.M{"_id": item.ID},
			bson.M{"$set": bson.M{"thumbnail_url": newThumbURL}},
		)

		if err != nil {
			fmt.Printf("❌ DB Update failed: %v\n", err)
			errCount++
		} else {
			fmt.Printf("✅ Done!\n")
			successCount++
		}

		// Sleep briefly to be nice to GCS
		time.Sleep(100 * time.Millisecond)
	}

	fmt.Println("------------------------------------------------")
	fmt.Printf("Migration Complete.\n✅ Updated: %d\n⏭️  Skipped: %d\n❌ Errors: %d\n", successCount, skipCount, errCount)
}
