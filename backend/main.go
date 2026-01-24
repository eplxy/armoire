package main

import (
	"log"
	"os"

	_ "github.com/exply/armoire/docs"
	"github.com/exply/armoire/internal/database"
	"github.com/exply/armoire/internal/router"
	"github.com/joho/godotenv"
)

// @title           Armoire API
// @version         1.0
// @description     API for Armoire application
// @termsOfService  http://swagger.io/terms/

// @host      localhost:8080
// @BasePath  /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.
func main() {

	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}

	mongoURI := os.Getenv("MONGO_URI")
	database.InitDB(mongoURI)

	router := router.SetupRouter()
	router.Run() // listens on 0.0.0.0:8080 by default
}
