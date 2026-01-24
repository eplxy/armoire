package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// This struct matches the JSON we want Gemini to generate
type ClothingAnalysis struct {
	Name        string   `json:"name"`
	Category    string   `json:"category"`
	Colors      []string `json:"colors"`
	Seasons     []string `json:"seasons"`
	Occasions   []string `json:"occasions"`
	Description string   `json:"description"`
}

type AIClient struct {
	GenModel   *genai.GenerativeModel
	EmbedModel *genai.EmbeddingModel
}

func NewAIClient(ctx context.Context) (*AIClient, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, err
	}

	model := client.GenerativeModel("gemini-3-flash-preview")
	model.ResponseMIMEType = "application/json" // Force JSON output

	// Use the latest embedding model
	embedModel := client.EmbeddingModel("text-embedding-004")

	return &AIClient{
		GenModel:   model,
		EmbedModel: embedModel,
	}, nil
}

// AnalyzeImage sends the image data to Gemini and gets structured tags
func (c *AIClient) AnalyzeImage(ctx context.Context, imageData io.Reader) (*ClothingAnalysis, error) {
	prompt := `
		Analyze this image of a clothing item. 
		Return a JSON object with the following fields:
		- name: A creative, short title (e.g. "Vintage Acid Wash Jeans")
		- category: The specific type (e.g. "Denim Jacket", "Sneakers")
		- colors: A list of dominant colors
		- seasons: Best seasons to wear this (Winter, Summer, etc.)
		- occasions: Best occasions (Casual, Formal, Party, Work)
		- description: A detailed visual description of the item, including texture, pattern, and style. 
		  (This description will be used for AI search, so be descriptive)
	`

	// Read image data into bytes
	imgBytes, err := io.ReadAll(imageData)
	if err != nil {
		return nil, fmt.Errorf("failed to read image data: %w", err)
	}

	// Send image data inline to Gemini
	resp, err := c.GenModel.GenerateContent(ctx,
		genai.Text(prompt),
		genai.ImageData("jpeg", imgBytes),
	)
	if err != nil {
		return nil, err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from Gemini")
	}

	// Extract text part
	rawJSON, ok := resp.Candidates[0].Content.Parts[0].(genai.Text)
	if !ok {
		return nil, fmt.Errorf("unexpected response format")
	}

	// Clean up potential markdown formatting (```json ... ```)
	jsonStr := strings.TrimPrefix(string(rawJSON), "```json")
	jsonStr = strings.TrimPrefix(jsonStr, "```")
	jsonStr = strings.TrimSuffix(jsonStr, "```")

	var analysis ClothingAnalysis
	if err := json.Unmarshal([]byte(jsonStr), &analysis); err != nil {
		return nil, err
	}

	return &analysis, nil
}

// GetEmbedding converts the description into a vector
func (c *AIClient) GetEmbedding(ctx context.Context, text string) ([]float32, error) {
	resp, err := c.EmbedModel.EmbedContent(ctx, genai.Text(text))
	if err != nil {
		return nil, err
	}
	return resp.Embedding.Values, nil
}
