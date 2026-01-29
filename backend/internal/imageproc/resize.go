package imageproc

import (
	"bytes"
	"image"
	"image/jpeg"
	"image/png"
	"net/http"

	"github.com/nfnt/resize"
)

func CreateThumbnail(data []byte, maxWidth uint) ([]byte, error) {
	img, format, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, err
	}

	// 2. Resize (Lanczos3 is high quality, but slower. NearestNeighbor is fast.)
	// Since this happens once on upload, use Lanczos3 for quality.
	m := resize.Resize(maxWidth, 0, img, resize.Lanczos3)

	// 3. Encode back to bytes
	buf := new(bytes.Buffer)
	if format == "png" || http.DetectContentType(data) == "image/png" {
		err = png.Encode(buf, m)
	} else {
		err = jpeg.Encode(buf, m, nil)
	}

	return buf.Bytes(), err
}
