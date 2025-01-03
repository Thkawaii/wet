package handler

import (
	"cabana/entities"
	"cabana/repository"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
)

type PaymentHandler struct {
	repo repository.PaymentRepository
}

func NewPaymentHandler(repo repository.PaymentRepository) *PaymentHandler {
	return &PaymentHandler{repo: repo}
}

func (h *PaymentHandler) CreatePayment(c *fiber.Ctx) error {
	cardType := c.Query("card_type")

	var payment entities.Payment

	if err := c.BodyParser(&payment); err != nil {
		log.Println("BodyParser Error:", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	log.Printf("Parsed Payment: %+v\n", payment)

	payment.PaymentDate = time.Now().Format("2006-01-02 15:04:05")

	if err := h.repo.CreatePayment(&payment); err != nil {
		log.Println("CreatePayment Error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create payment"})
	}

	if cardType != "" {
		paid := entities.Paid{
			CardType:  cardType,
			PaymentID: payment.PaymentID,
		}
		if err := h.repo.CreatePaid(&paid); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create paid record"})
		}
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Payment created successfully"})
}
