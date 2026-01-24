package router

import (
	"github.com/exply/armoire/internal/handlers"
	"github.com/exply/armoire/internal/middleware"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	router.Use(cors.Default()) // All origins allowed by default

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// auth

	router.POST("/auth/register", handlers.RegisterHandler)
	router.POST("/auth/login", handlers.LoginHandler)

	// Protected Routes
	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/clothing/upload", handlers.UploadClothingHandler)
	}

	router.GET("/ping", pingHandler)
	return router
}

// pingHandler handles ping requests
// @Summary      Ping endpoint
// @Description  Returns pong message
// @Tags         health
// @Accept       json
// @Produce      json
// @Success      200  {object}  PingResponse
// @Router       /ping [get]
func pingHandler(c *gin.Context) {
	c.JSON(200, PingResponse{
		Message: "pong",
	})
}

// PingResponse represents the ping response
type PingResponse struct {
	Message string `json:"message" example:"pong"`
}
