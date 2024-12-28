export interface Paid {
    ID?: number;            // Primary key for Paid
    CardType?: string;      // Type of card (e.g., Visa, MasterCard)
    PaymentID?: number;     // Foreign key with unique constraint for 1-to-1 relationship
   
}
