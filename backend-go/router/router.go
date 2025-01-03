package router

import (
	"cabana/adapter/handler"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, bookingHandler *handler.BookingHandler, promotionHandler *handler.PromotionHandler, paymentHandler *handler.PaymentHandler, reviewHandler *handler.ReviewHandler) {
	api := app.Group("/api")

	api.Get("/bookings", bookingHandler.GetAllBookings)
	api.Get("/bookings/:id", bookingHandler.GetBookingByID)

	api.Get("/promotions/check", promotionHandler.CheckPromotionCode)
	api.Post("/payments", paymentHandler.CreatePayment)
	api.Put("/promotions/use-count", promotionHandler.UpdateUseCount)

	api.Post("/reviews", reviewHandler.CreateReview)
	api.Get("/reviews", reviewHandler.GetAllReviews)
	api.Get("/reviews/:id", reviewHandler.GetReviewByID)
	api.Put("/reviews/:id", reviewHandler.UpdateReview)
	api.Delete("/reviews/:id", reviewHandler.DeleteReview)
}
