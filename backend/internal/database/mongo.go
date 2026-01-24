package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

// InitDB initializes the MongoDB connection
func InitDB(uri string) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// Verify the connection with a ping
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Could not connect to MongoDB: ", err)
	}

	fmt.Println("Connected to MongoDB Atlas!")
	Client = client
}

// GetCollection returns a handle to a specific collection
func GetCollection(collectionName string) *mongo.Collection {
	return Client.Database("aremoir-db").Collection(collectionName)
}
