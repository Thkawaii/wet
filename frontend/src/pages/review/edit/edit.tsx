import React, { useEffect, useState } from "react";
import "./edit.css";
import { useNavigate, useParams } from "react-router-dom";

interface Review {
  driverId: string;
  passengerId: string;
  reviewId: string;
  comment: string;
  rating: number;
}

const Edit: React.FC = () => {
  const navigate = useNavigate();
  const { reviewId } = useParams<{ reviewId: string }>(); // รับ reviewId จาก URL

  const [review, setReview] = useState<Review>({
    driverId: "",
    passengerId: "",
    reviewId: "",
    comment: "",
    rating: 0,
  });

  const [errors, setErrors] = useState({
    driverId: "",
    passengerId: "",
    comment: "",
    rating: "",
  });

  // ดึงข้อมูลรีวิวที่ต้องการแก้ไข
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8001/get/reviews/id?id=${localStorage.getItem("review_id")}`);
        if (!response.ok) {
          throw new Error("Failed to fetch review data.");
        }
        const {data:[result]} = await response.json();
        console.log(result);
        
        setReview({
          driverId: result.driver_id,
          passengerId: result.passenger_id,
          reviewId: result.review_id.toString(),
          comment: result.comment,
          rating: result.rating,
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchReview();
  }, [reviewId]);
  const offensiveWords = {
    shit: "s*",
    damn: "d*",
    hell: "h*",
    stupid: "s*",
    fuck: "f*",
    asshole: "a*",
    bastard: "b*",
    jerk: "j*",
    crap: "c*",
    bitch: "b*",
    ควาย: "ค*",
    บ้า: "บ*",
    แม่ง: "แ*",
    กาก: "ก*",
    เลว: "ล*",
    สันดาน: "ส*",
    ไอ้เวร: "ไ*",
    โง่: "โ*",
    ถ่อย: "ถ*",
    ชั่ว: "ช*",
    ไอ้: "อ*",
  };
  const handleSave = async () => {
    try {
       // Offensive words filtering
    let containsOffensiveWord = false;

    Object.keys(offensiveWords).forEach((word) => {
      const regex = new RegExp(word, "gi");
      if (regex.test(review.comment)) {
        containsOffensiveWord = true; // Flag offensive word presence
      }
    });

    if (containsOffensiveWord) {
      alert("คำไม่สุภาพไม่สามารถแสดงข้อมูลได้");
      return; // Stop the function if offensive words are found
    }
      const response = await fetch("http://127.0.0.1:8001/edit/reviews", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          review_id: localStorage.getItem("review_id"),
          rating: review.rating,
          comment: review.comment,
          booking_id: localStorage.getItem("book_id"),
          passenger_id: review.passengerId,
          driver_id: review.driverId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save review.");
      }

      alert("Review updated successfully.");
      navigate("/review/history");
    } catch (error) {
      console.error(error);
      alert("Failed to update review.");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };
  const handleChange = (field: keyof Review, value: string | number) => {
    setReview((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };
  const validateField = (field: keyof Review, value: string | number) => {
    let errorMessage = "";

    if (field === "driverId" || field === "passengerId") {
      if (!/^\d+$/.test(value as string)) {
        errorMessage = "Must be numeric only.";
      }
    }

    if (field === "rating") {
      if (value < 1 || value > 5) {
        errorMessage = "Rating must be between 1 and 5.";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
  };


  return (
    <div className="em">
       <video className="tan" autoPlay muted loop>
    <source
      src="https://media.istockphoto.com/id/1585424976/th/%E0%B8%A7%E0%B8%B4%E0%B8%94%E0%B8%B5%E0%B9%82%E0%B8%AD/%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B8%AB%E0%B8%A5%E0%B8%B1%E0%B8%87%E0%B8%A2%E0%B9%89%E0%B8%AD%E0%B8%99%E0%B8%A2%E0%B8%B8%E0%B8%84-80-%E0%B8%A7%E0%B8%87%E0%B8%88%E0%B8%A3%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%81%E0%B8%82%E0%B9%88%E0%B8%87%E0%B8%82%E0%B8%B1%E0%B8%99%E0%B8%99%E0%B8%B5%E0%B8%AD%E0%B8%AD%E0%B8%99.mp4?s=mp4-640x640-is&k=20&c=KumjBe-2tg2EqD9rVxtmanQvlfCZgwpXLoI9Qo6FN0U="
      type="video/mp4"
    />
    Your browser does not support the video tag.
  </video>
      <div className="edit-card">
      <video autoPlay muted loop className="xox">
        <source 
          src="https://videos.pexels.com/video-files/2053100/2053100-sd_640_360_30fps.mp4" 
          type="video/mp4" 
        />
        Your browser does not support the video tag.
      </video>
        <h2 className="edit-title">Edit Review</h2>
        <div className="edit-form">
          <div className="form-row">
            <label>Driver ID</label>
            <input
              type="text"
              value={review.driverId}
              onChange={(e) => handleChange("driverId", e.target.value)}
            />
            {errors.driverId && <div className="error-message">{errors.driverId}</div>}
          </div>
          <div className="form-row">
            <label>Passenger ID</label>
            <input
              type="text"
              value={review.passengerId}
              onChange={(e) => handleChange("passengerId", e.target.value)}
            />
            {errors.passengerId && <div className="error-message">{errors.passengerId}</div>}
          </div>
          <div className="form-row">
            <label>Review ID</label>
            <input type="text" value={review.reviewId} readOnly />
          </div>
          <div className="form-row">
            <label>Comment</label>
            <input
              type="text"
              value={review.comment}
              onChange={(e) => handleChange("comment", e.target.value)}
            />
            {errors.comment && <div className="error-message">{errors.comment}</div>}
          </div>
          <div className="form-row">
            <label>Features</label>
            <input
              type="text"
              placeholder="Comma-separated features"
              value={review.features}
              onChange={(e) => handleChange("features", e.target.value)}
            />
            {errors.features && <div className="error-message">{errors.features}</div>}
          </div>
          <div className="form-row">
            <label>Rating</label>
            <input
              type="number"
              min={1}
              max={5}
              value={review.rating}
              onChange={(e) => handleChange("rating", parseInt(e.target.value))}
            />
            {errors.rating && <div className="error-message">{errors.rating}</div>}
          </div>
        </div>
        <div className="edit-actions">
          <button className="back-btn" onClick={handleBack}>
            Go Back
          </button>
          <button className="save-btx" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Edit;
