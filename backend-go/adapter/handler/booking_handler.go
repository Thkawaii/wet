package handler

import (
	"cabana/repository"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type BookingHandler struct {
	repo repository.BookingRepository
}

func NewBookingHandler(repo repository.BookingRepository) *BookingHandler {
	return &BookingHandler{repo: repo}
}

func (h *BookingHandler) GetAllBookings(c *fiber.Ctx) error {
	bookings, err := h.repo.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(bookings)
}

func (h *BookingHandler) GetBookingByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid booking ID"})
	}

	booking, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Booking not found"})
	}

	return c.JSON(booking)
}
