package ai

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
)

func RemoveBackground(imageBytes []byte, filename string) ([]byte, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("image", filename)
	if err != nil {
		return nil, err
	}
	part.Write(imageBytes)
	writer.Close()

	// 2. Send to local Python service
	resp, err := http.Post(
		"http://localhost:5000/remove",
		writer.FormDataContentType(),
		body,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to contact bg-service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("bg-service returned %d", resp.StatusCode)
	}

	// 3. Return the transparent PNG bytes
	return io.ReadAll(resp.Body)
}
