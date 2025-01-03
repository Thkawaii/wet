package main

import (
	"cabana/adapter/db"
	"cabana/adapter/handler"
	"cabana/repository"
	"cabana/router"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	db.ConnectDB()

	bookingRepo := repository.NewBookingRepository(db.DB)
	bookingHandler := handler.NewBookingHandler(bookingRepo)

	promotionRepo := repository.NewPromotionRepository(db.DB)
	promotionHandler := handler.NewPromotionHandler(promotionRepo)

	paymentRepo := repository.NewPaymentRepository(db.DB)
	paymentHandler := handler.NewPaymentHandler(paymentRepo)

	reviewRepo := repository.NewReviewRepository(db.DB)
	reviewHandler := handler.NewReviewHandler(reviewRepo)

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowHeaders:     "Origin,Content-Type,Accept,Content-Length,Accept-Language,Accept-Encoding,Connection,Access-Control-Allow-Origin,Authorization",
		AllowOrigins:     "*",
		AllowCredentials: false,
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
	}))

	router.SetupRoutes(app, bookingHandler, promotionHandler, paymentHandler, reviewHandler)

	log.Println("Server running at http://localhost:8080")
	log.Fatal(app.Listen(":8080"))
}
