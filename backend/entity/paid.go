package entity


type Paid struct {
	ID             uint      `gorm:"primaryKey;autoIncrement"`       // Primary key for Paid
	CardType       string    `gorm:"type:varchar(50);not null"`      // Type of card (e.g., Visa, MasterCard)
	PaymentID      uint      `gorm:"unique;not null"`               // Foreign key with unique constraint for 1-to-1
	// Payment       Payment   `gorm:"foreignKey:PaymentID"`         // Association with Payment
}