package ai

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
)

func RemoveBackground(imageBytes []byte, filename string) ([]byte, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("image_file", filename)
	if err != nil {
		return nil, err
	}
	part.Write(imageBytes)
	writer.Close()

	req, _ := http.NewRequest("POST", "https://clipdrop-api.co/remove-background/v1", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	req.Header.Set("x-api-key", os.Getenv("CLIPDROP_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("API connection failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("API error %d", resp.StatusCode)
	}

	return io.ReadAll(resp.Body)
}
