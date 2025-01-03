import React, { useEffect, useState } from "react";
import "./History.css";
import { Outlet, useNavigate } from "react-router-dom";
import { apiRequest } from "../../../config/ApiService";
import { Endpoint } from "../../../config/Endpoint";

interface Review {
  review_id: number;
  rating: number;
  comment: string;
  booking_id: number;
  passenger_id: number;
  driver_id: number;
  feedback: string;
}

const History: React.FC = () => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<Review[]>([]);

  const loadReviews = async () => {
    const response = await apiRequest<Review[]>("GET", Endpoint.REVIEW);

    if (response) {
      setReviews(response);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleEdit = (review_id: string): void => {
    navigate(`/edit`, {
      state: {
        reviewId: review_id,
      },
    });
  };

  const handleDelete = async (reviewId: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete review with ID: ${reviewId}?`
    );

    if (confirmDelete) {
      try {
        const response = await apiRequest(
          "DELETE",
          `${Endpoint.REVIEW}/${reviewId}`
        );

        if (response) {
          await loadReviews();
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert(`An error occurred while deleting review with ID: ${reviewId}.`);
      }
    }
  };

  return (
    <div className="gg">
      <video autoPlay muted loop className="background-video">
        <source
          src="https://media.istockphoto.com/id/1409514009/th/%E0%B8%A7%E0%B8%B4%E0%B8%94%E0%B8%B5%E0%B9%82%E0%B8%AD/%E0%B8%A3%E0%B8%96%E0%B8%AA%E0%B8%9B%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B8%95%E0%B8%A7%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B8%9C%E0%B9%88%E0%B8%B2%E0%B8%99%E0%B8%AD%E0%B8%B8%E0%B9%82%E0%B8%A1%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%99%E0%B8%B5%E0%B8%AD%E0%B8%AD%E0%B8%99%E0%B8%9E%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%A1%E0%B8%9B%E0%B9%89%E0%B8%B2%E0%B8%A2%E0%B8%9A%E0%B8%AD%E0%B8%81%E0%B8%97%E0%B8%B4%E0%B8%A8%E0%B8%97%E0%B8%B2%E0%B8%87-%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B9%80%E0%B8%84%E0%B8%A5%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%99%E0%B9%84%E0%B8%AB%E0%B8%A7%E0%B8%A7%E0%B8%99%E0%B8%8B%E0%B9%89%E0%B9%8D%E0%B8%B2%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B8%AA%E0%B8%B4%E0%B9%89%E0%B8%99%E0%B8%AA%E0%B8%B8%E0%B8%94.mp4?s=mp4-640x640-is&k=20&c=1DH1NNCLLSi1xO2qd0I3iSFjjvktbUPlEgArzP_zjIo="
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      <div className="review-history-container">
        {/* Content */}
        <div className="review-history-content">
          <div className="lol">Review History</div>
          <table className="review-table">
            <thead>
              <tr>
                <th>Review ID</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Feedback</th>
                <th>Booking ID</th>
                <th>Passenger ID</th>
                <th>Driver ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review: any) => (
                <tr key={review.review_id}>
                  <td>{review.review_id}</td>
                  <td>{review.rating}</td>
                  <td>{review.comment}</td>
                  <td>{review.feedback}</td>
                  <td>{review.booking_id}</td>
                  <td>{review.passenger_id}</td>
                  <td>{review.driver_id}</td>
                  <td>
                    {/* Edit Button */}
                    <button
                      className="ii"
                      onClick={() => handleEdit(review.review_id)}
                      style={{ marginRight: "5px" }}
                    >
                      Edit
                    </button>
                    {/* Delete Button */}
                    <button
                      className="oo"
                      onClick={() => handleDelete(review.review_id)}
                      style={{ marginRight: "5px" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default History;
