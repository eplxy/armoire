package storage

import (
	"context"
	"io"
	"time"

	"cloud.google.com/go/storage"
	"google.golang.org/api/option"
)

type StorageClient struct {
	Client     *storage.Client
	BucketName string
}

func NewStorageClient(bucketName string) (*StorageClient, error) {
	ctx := context.Background()
	client, err := storage.NewClient(ctx, option.WithCredentialsFile("gcs_service_account.json"))
	if err != nil {
		return nil, err
	}

	return &StorageClient{
		Client:     client,
		BucketName: bucketName,
	}, nil
}

func (s *StorageClient) UploadFile(file io.Reader, filename string) (string, error) {
	ctx := context.Background()
	ctx, cancel := context.WithTimeout(ctx, time.Second*50)
	defer cancel()

	wc := s.Client.Bucket(s.BucketName).Object(filename).NewWriter(ctx)

	// Copy the file content to the bucket writer
	if _, err := io.Copy(wc, file); err != nil {
		return "", err
	}

	if err := wc.Close(); err != nil {
		return "", err
	}

	// Return the GCS URI (perfect for Gemini) or the Public URL
	// For Gemini processing, return "gs://bucket/filename"
	return "gs://" + s.BucketName + "/" + filename, nil
}
