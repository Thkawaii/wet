package controller

import (
	"net/http"
	"project-se/entity"
	"project-se/config"
	"github.com/gin-gonic/gin"
)

// POST /paids
func CreatePaid(c *gin.Context) {
	var paid entity.Paid
	if err := c.ShouldBindJSON(&paid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create the Paid record
	if err := config.DB().Create(&paid).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": paid})
}

// GET /paids/:id
func GetPaid(c *gin.Context) {
	var paid entity.Paid
	id := c.Param("id")

	// Retrieve the Paid record by ID
	if err := config.DB().Preload("Payment").First(&paid, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Paid record not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": paid})
}

// GET /paids
func ListPaids(c *gin.Context) {
	var paids []entity.Paid

	// Retrieve all Paid records
	if err := config.DB().Preload("Payment").Find(&paids).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": paids})
}

// DELETE /paids/:id
func DeletePaid(c *gin.Context) {
	id := c.Param("id")

	// Delete the Paid record by ID
	if tx := config.DB().Delete(&entity.Paid{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Paid record not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": "Paid record deleted successfully"})
}

// PATCH /paids/:id
func UpdatePaid(c *gin.Context) {
	var paid entity.Paid
	id := c.Param("id")

	// Find the existing Paid record
	if err := config.DB().First(&paid, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Paid record not found"})
		return
	}

	// Bind JSON input to the existing Paid record
	if err := c.ShouldBindJSON(&paid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Save the updated Paid data
	if err := config.DB().Save(&paid).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": paid})
}
