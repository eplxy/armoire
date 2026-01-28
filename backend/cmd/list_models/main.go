package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

func main() {
	ctx := context.Background()

	godotenv.Load()

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY environment variable not set")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}
	defer client.Close()

	iter := client.ListModels(ctx)
	for {
		model, err := iter.Next()
		if err != nil {
			break
		}
		fmt.Printf("Model: %s\n", model.Name)
		fmt.Printf("  Display Name: %s\n", model.DisplayName)
		fmt.Printf("  Description: %s\n", model.Description)
		fmt.Printf("  Supported Generation Methods: %v\n", model.SupportedGenerationMethods)
		fmt.Println()
	}
}
