package usecase

import (
	"cabana/entities"
	"cabana/repository"
)

type BookingUseCase interface {
	GetAllBookings() ([]entities.Booking, error)
	GetBookingByID(id int) (*entities.Booking, error)
}

type bookingUseCase struct {
	repo repository.BookingRepository
}

func NewBookingUseCase(repo repository.BookingRepository) BookingUseCase {
	return &bookingUseCase{repo: repo}
}

func (uc *bookingUseCase) GetAllBookings() ([]entities.Booking, error) {
	return uc.repo.GetAll()
}

func (uc *bookingUseCase) GetBookingByID(id int) (*entities.Booking, error) {
	return uc.repo.GetByID(id)
}
