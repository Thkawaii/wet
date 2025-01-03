package handler

import (
	"cabana/entities"
	"cabana/repository"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type ReviewHandler struct {
	repo repository.ReviewRepository
}

func NewReviewHandler(repo repository.ReviewRepository) *ReviewHandler {
	return &ReviewHandler{repo: repo}
}

func (h *ReviewHandler) CreateReview(c *fiber.Ctx) error {
	var review entities.Review

	if err := c.BodyParser(&review); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if err := h.repo.Create(&review); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create review"})
	}

	return c.Status(fiber.StatusCreated).JSON(review)
}

func (h *ReviewHandler) GetAllReviews(c *fiber.Ctx) error {
	reviews, err := h.repo.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch reviews"})
	}

	return c.JSON(reviews)
}

func (h *ReviewHandler) GetReviewByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid review ID"})
	}

	review, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Review not found"})
	}

	return c.JSON(review)
}

func (h *ReviewHandler) UpdateReview(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid review ID"})
	}

	var review entities.Review
	if err := c.BodyParser(&review); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	review.ReviewID = id

	if err := h.repo.Update(&review); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update review"})
	}

	return c.JSON(review)
}

func (h *ReviewHandler) DeleteReview(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid review ID"})
	}

	if err := h.repo.Delete(id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete review"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "successfully"})
}
