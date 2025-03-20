package cloudinary

import (
	"context"
	"mime/multipart"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type CloudinaryConfig struct {
	CloudName string
	APIKey    string
	APISecret string
}

func NewCloudinary(cldName, apiKey, apiSecret string) (*cloudinary.Cloudinary, error){
	cld, err := cloudinary.NewFromParams(cldName, apiKey, apiSecret)
	if err != nil {
		return nil, err
	}

	return cld, nil
}

func UploadImage(ctx context.Context, cloudinary *cloudinary.Cloudinary, file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
	imgParam := uploader.UploadParams{
		PublicID:       fileHeader.Filename,
		Folder:         "novel",
		AllowedFormats: []string{"jpg", "png", "jpeg"},
	}

	uploadResult, err := cloudinary.Upload.Upload(ctx, file, imgParam)
	if err != nil {
		return "", err
	}

	return uploadResult.SecureURL, nil
}
