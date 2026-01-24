package main

import (
	_ "github.com/exply/armoire/docs" // Import generated docs
	"github.com/exply/armoire/internal/router"
)

// @title           Armoire API
// @version         1.0
// @description     API for Armoire application
// @termsOfService  http://swagger.io/terms/

// @host      localhost:8080
// @BasePath  /

func main() {
	router := router.SetupRouter()

	router.Run() // listens on 0.0.0.0:8080 by default
}
