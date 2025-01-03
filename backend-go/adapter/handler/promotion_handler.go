package handler

import (
	"cabana/repository"
	"log"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

type PromotionHandler struct {
	repo repository.PromotionRepository
}

func NewPromotionHandler(repo repository.PromotionRepository) *PromotionHandler {
	return &PromotionHandler{repo: repo}
}

func (h *PromotionHandler) CheckPromotionCode(c *fiber.Ctx) error {
	promotionCode := c.Query("code")
	distanceParam := c.Query("distance")
	priceParam := c.Query("price")

	distance, err := strconv.ParseFloat(distanceParam, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid distance value",
		})
	}
	price, err := strconv.ParseFloat(priceParam, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid price value",
		})
	}

	promotion, err := h.repo.GetPromotionByCode(promotionCode)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "Promotion code not found",
		})
	}

	currentTime := time.Now()
	if promotion.EndDate.Before(currentTime) {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message":      "Promotion code has expired",
			"promotion_id": promotion.ID,
			"can_use":      false,
		})
	}

	if promotion.UseCount >= promotion.UseLimit {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message":      "Promotion code usage limit reached",
			"promotion_id": promotion.ID,
			"can_use":      false,
		})
	}

	canUse := false
	switch promotion.DistanceCondition {
	case "greater":
		canUse = distance > promotion.Distance
	case "greater_equal":
		canUse = distance >= promotion.Distance
	case "less":
		canUse = distance < promotion.Distance
	case "less_equal":
		canUse = distance <= promotion.Distance
	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message":      "Invalid distance_condition in database",
			"promotion_id": promotion.ID,
			"can_use":      false,
		})
	}

	if !canUse {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message":      "Promotion code cannot be used for this distance",
			"promotion_id": promotion.ID,
			"can_use":      false,
		})
	}

	discountType, err := h.repo.GetDiscountTypeByID(promotion.DiscountTypeID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch discount type",
		})
	}

	if discountType.DiscountType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid DiscountType. Please provide a valid DiscountType.",
		})
	}

	var discountAmount float64
	if discountType.DiscountType == "percent" {
		discountAmount = (promotion.Discount / 100) * price
	} else if discountType.DiscountType == "amount" {
		discountAmount = promotion.Discount
	} else {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid DiscountType. Please provide either 'percent' or 'amount'.",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":        "Promotion code can be used",
		"promotion_id":   promotion.ID,
		"can_use":        true,
		"discount_type":  discountType.DiscountType,
		"discount_value": discountAmount,
		"details":        promotion,
	})
}

func (h *PromotionHandler) UpdateUseCount(c *fiber.Ctx) error {
	promotionID, err := strconv.Atoi(c.Query("promotion_id"))
	if err != nil || promotionID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid promotion ID"})
	}

	promotion, err := h.repo.GetByID(promotionID)
	if err != nil {
		log.Println("Get Promotion Error:", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Promotion not found"})
	}

	if promotion.UseCount >= promotion.UseLimit {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Promotion usage limit reached",
		})
	}

	promotion.UseCount++
	if err := h.repo.UpdateUseCountByID(promotion.ID, promotion.UseCount); err != nil {
		log.Println("Update UseCount Error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update use count"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":   "Promotion usage updated successfully",
		"use_count": promotion.UseCount,
	})
}
