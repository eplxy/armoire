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

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// auth

	router.POST("/auth/register", handlers.RegisterHandler)
	router.POST("/auth/login", handlers.LoginHandler)

	// Protected Routes
	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/clothing/upload", handlers.UploadClothingHandler)
		protected.POST("/clothing/search", handlers.SearchClothingHandler)
		protected.GET("/clothing/stats", handlers.GetUserStatsHandler)
		protected.GET("/clothing/:id", handlers.GetClothingByIDHandler)
		protected.PATCH("/clothing/:id", handlers.UpdateClothingHandler)
		protected.DELETE("/clothing/:id", handlers.DeleteClothingHandler)
		protected.GET("/user/userinfo", handlers.GetCurrentUserHandler)
	}
	router.GET("/clothing/:id/owner", handlers.GetClothingOwnerNameHandler)

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
