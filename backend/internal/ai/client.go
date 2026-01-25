package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/exply/armoire/internal/taxonomy"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// This struct matches the JSON we want Gemini to generate
type ClothingAnalysis struct {
	Name        string   `json:"name"`
	Category    string   `json:"category"`
	SubCategory string   `json:"sub_category"`
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

	model := client.GenerativeModel("gemini-2.0-flash")
	model.ResponseMIMEType = "application/json" // Force JSON output

	// Use the latest embedding model
	embedModel := client.EmbeddingModel("text-embedding-004")

	return &AIClient{
		GenModel:   model,
		EmbedModel: embedModel,
	}, nil
}

// AnalyzeImage sends the image data to Gemini and gets structured tags
func (c *AIClient) AnalyzeImage(ctx context.Context, imageData io.Reader, mimeType string) (*ClothingAnalysis, error) {
	// join the slices into comma-separated strings
	validCategories := strings.Join(taxonomy.Categories, ", ")
	validSubCategories := strings.Join(taxonomy.SubCategories, ", ")
	validColors := strings.Join(taxonomy.Colors, ", ")
	validOccasions := strings.Join(taxonomy.Occasions, ", ")

	prompt := fmt.Sprintf(`
		You are a fashion archivist. Analyze this image of a clothing item.
		
		STRICT RULES:
		1. Return ONLY valid JSON.
		2. Use ONLY the allowed values provided below. Do not invent new tags.

		ALLOWED VALUES:
		- category: Choose one from [%s]
		- sub_category: Choose one from [%s]
		- colors: Choose up to 3 from [%s]
        - occasions: Choose from [%s]

		JSON STRUCTURE:
		{
			"name": "A creative, short title (e.g. 'Vintage Acid Wash Jeans')",
			"category": "One value from the allowed list",
			"sub_category": "One value from the allowed list",
			"colors": ["Value1", "Value2"],
			"seasons": ["Winter", "Fall"],
			"occasions": ["Casual"],
			"description": "A detailed visual description for search embedding."
		}
	`, validCategories, validSubCategories, validColors, validOccasions)

	// Read image data into bytes
	imgBytes, err := io.ReadAll(imageData)
	if err != nil {
		return nil, fmt.Errorf("failed to read image data: %w", err)
	}

	// Send image data inline to Gemini
	resp, err := c.GenModel.GenerateContent(ctx,
		genai.Text(prompt),
		genai.ImageData(mimeType, imgBytes),
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

// GenerateStylistBlurb takes a map of stats (e.g. {"Black": 5, "Blue": 2, "Tops": 10})
func (c *AIClient) GenerateStylistBlurb(ctx context.Context, stats map[string]interface{}) (string, error) {
	model := c.GenModel
	model.ResponseMIMEType = "text/plain" // We just want a string this time

	prompt := fmt.Sprintf(`
		You are a witty, helpful personal stylist.
		I will give you statistics about a user's closet. 
		
		CLOSET DATA:
		%v
		
		YOUR TASK:
		Write a short, engaging "Message of the Day" (max 2-3 sentences).
		1. Compliment their specific style based on the data (e.g., "You really love your earth tones!" or "You are the queen of denim!").
		2. Give one specific recommendation for what to wear today OR what they should buy next to balance their wardrobe.
		
		Tone: Friendly, encouraging, and slightly fashion-forward.
		Keep it under 60 words.
	`, stats)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "Your closet is looking great today! Time to mix and match.", nil
	}

	// Extract text
	return fmt.Sprintf("%s", resp.Candidates[0].Content.Parts[0]), nil
}
