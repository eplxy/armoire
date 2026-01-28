package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ClothingItem struct {
	ID     primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID string             `bson:"user_id" json:"userId"` // Good for scaling later

	// Image Data
	ImageURL     string `bson:"image_url" json:"imageUrl"` // Public URL for Frontend
	GCSURI       string `bson:"gcs_uri" json:"-"`          // gs:// path for Gemini API (internal use)
	ThumbnailURL string `bson:"thumbnail_url" json:"thumbnailUrl"`

	// Basic Metadata
	Name        string `bson:"name" json:"name"`                // e.g., "Vintage Denim Jacket"
	Category    string `bson:"category" json:"category"`        // e.g., "Outerwear", "Top", "Bottom"
	SubCategory string `bson:"sub_category" json:"subCategory"` // e.g., "Jacket", "Shirt", "Pants"

	// The "Vibe" Engine
	// Gemini will generate a text description, which we then convert to a vector
	Description string    `bson:"description" json:"description"`
	Embedding   []float32 `bson:"embedding" json:"-"` // The Vector! (Don't send to frontend usually)

	// Tags
	Colors    []string `bson:"colors" json:"colors"`
	Seasons   []string `bson:"seasons" json:"seasons"`     // Winter, Summer
	Occasions []string `bson:"occasions" json:"occasions"` // Casual, Formal

	// Timestamps
	CreatedAt time.Time `bson:"created_at" json:"createdAt"`
	UpdatedAt time.Time `bson:"updated_at" json:"updatedAt"`
	IsPublic  bool      `bson:"is_public" json:"isPublic"`
}
