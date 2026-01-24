package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Outfit struct {
	ID     primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID string             `bson:"user_id" json:"userId"`
	Name   string             `bson:"name" json:"name"`

	// References to ClothingItems
	ItemIDs []primitive.ObjectID `bson:"item_ids" json:"itemIds"`

	// "Vibe" for the whole outfit
	// e.g., "Cozy study session fit"
	VibeTags []string `bson:"vibe_tags" json:"vibeTags"`

	CreatedAt time.Time `bson:"created_at" json:"createdAt"`
}
