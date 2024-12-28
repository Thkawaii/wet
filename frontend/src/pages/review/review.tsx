import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReviewInterface } from '../../interfaces/lReview';
import { GetDriver } from "../../services/https/DriverAPI";
import { GetPassenger } from "../../services/https/PassengerAPI";
import { CreateReview } from "../../services/https/ReviewAPl";
import './Review.css';


const menuItems = [
    { name: "Home", icon: "https://cdn-icons-png.flaticon.com/128/18390/18390765.png", route: "/paid" },
    { name: "Payment", icon: "https://cdn-icons-png.flaticon.com/128/18209/18209461.png", route: "/payment" },
    { name: "Review", icon: "https://cdn-icons-png.flaticon.com/128/7656/7656139.png", route: "/review" },
    { name: "History", icon: "https://cdn-icons-png.flaticon.com/128/9485/9485945.png", route: "/review/history" },
  ];

  
const Review: React.FC = () => {
      const navigate = useNavigate();
      const [rating, setRating] = useState<number | null>(null);
      const [reviewText, setReviewText] = useState<string>('');
      const [feedbackOptions, setFeedbackOptions] = useState<string[]>([]);
      const [hovered, setHovered] = useState(false);
      const [selectedImage, setSelectedImage] = useState<string>("");
      const [driver, setDriver] = useState<any>(null);
      const [passenger, setPassenger] = useState<any>(null);
      const handleMenuClick = (item: { name: string; icon: string; route: string }) => {
        setSelectedImage(item.icon);
        navigate(item.route);
      };
      const toggleFeedbackOption = (option: string) => {
        setFeedbackOptions((prevOptions) =>
          prevOptions.includes(option)
            ? prevOptions.filter((o) => o !== option)
            : [...prevOptions, option]
        );
      };  
       // Fetch driver data
  const fetchDriver = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8001/get/driver");
      if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
      }
          const result = await response.json();
          
          setDriver(result.data); // อัปเดต state ด้วยข้อมูลใหม่
          localStorage.setItem(
            "driver_id", result.data
          )
      } catch (err) {
          console.error("Fetch error:", err);
          setDriver([]);
      }
  };

  // Fetch passenger data
  const fetchPassenger = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8001/get/passenger");
      if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
      }
          const result = await response.json();
          setPassenger(result.data); // อัปเดต state ด้วยข้อมูลใหม่
          localStorage.setItem(
            "passenger_id", result.data
          )
      } catch (err) {
          console.error("Fetch error:", err);
          setPassenger([]);
      }
  };
   // Use useEffect to call the functions on component mount
   useEffect(() => {
    fetchDriver();
    fetchPassenger();
  }, []);
  console.log(passenger);
  
  const handleSubmit = async () => {
    const offensiveWords = {
        'shit': 's*',
        'damn': 'd*',
        'hell': 'h*',
        'stupid': 's*',
        'fuck': 'f*',
        'asshole': 'a*',
        'bastard': 'b*',
        'jerk': 'j*',
        'crap': 'c*',
        'bitch': 'b*',
        'ควาย': 'ค*',
        'บ้า': 'บ*',
        'แม่ง': 'แ*',
        'กาก': 'ก*',
        'เลว': 'ล*',
        'สันดาน': 'ส*',
        'ไอ้เวร': 'ไ*',
        'โง่': 'โ*',
        'ถ่อย': 'ถ*',
        'ชั่ว': 'ช*',
        'ไอ้': 'อ*',
      
    };

    let containsOffensiveWord = false;

    Object.keys(offensiveWords).forEach((word) => {
      const regex = new RegExp(word, 'gi');
      if (regex.test(reviewText)) {
          containsOffensiveWord = true; // ถ้าพบคำไม่สุภาพ เปลี่ยนสถานะเป็น true
      }
  });
  
  if (containsOffensiveWord) {
      alert("คำไม่สุภาพไม่สามารถแสดงข้อมูลได้");
      return; // หยุดการทำงานต่อ
  }
  
  // เพิ่มการแสดงข้อความสุภาพ
  if (!containsOffensiveWord) {
      alert(` "${reviewText}" `);
      // return; // หยุดการทำงานหลังแสดงข้อความ
  }

  if (!reviewText.trim()) {
      alert("Please write a comment before submitting your review.");
      return;
  }

  if (feedbackOptions.length === 0) {
      alert("Please select at least one feedback option.");
      return;
  }
  
    try {
      const fetchResponse = await fetch("http://127.0.0.1:8001/add/comment", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              rating: rating,
              comment: reviewText.trim(),
              booking_id: localStorage.getItem("book_id"),
              passenger_id: passenger?.id,
              driver_id: driver?.id,
          }),
      });
  
      if (!fetchResponse.ok) {
          throw new Error(`HTTP error! status: ${fetchResponse.status}`);
      }
  
      const result = await fetchResponse.json(); // รับข้อมูลจาก API
      console.log("API Response:", result);
      alert("Review Submitted Successfully!");
      navigate("/review/history");
  } catch (error) {
      console.error("Error during fetch:", error);
      alert("Failed to submit review. Please try again.");
  }
};
        const handleCancel = () => {
            console.log("/payment");
          };
    
      const handleReviewLater = () => {
        alert("You can review later!");
        navigate("/"); // Redirect to the home or another page
      };
      return (
        <div className="ss">
        <div className="review-container">
        <video autoPlay muted loop className="jk">
        <source 
          src="https://media.istockphoto.com/id/675824868/th/%E0%B8%A7%E0%B8%B4%E0%B8%94%E0%B8%B5%E0%B9%82%E0%B8%AD/%E0%B8%82%E0%B8%B1%E0%B8%9A%E0%B8%A3%E0%B8%96%E0%B9%83%E0%B8%99%E0%B8%AD%E0%B8%B8%E0%B9%82%E0%B8%A1%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A1%E0%B8%B7%E0%B8%94.mp4?s=mp4-640x640-is&k=20&c=TX1SqvOdk-xW7NGCd7TJ7C8iigLdaE4-i8Tp1L4u5O0=" 
          type="video/mp4" 
        />
        Your browser does not support the video tag.
      </video>
            {/* Sidebar */}
      <div className="sidebar">
        {menuItems.map((item) => (
          <div
            key={item.name}
            className="menu-item"
            onClick={() => handleMenuClick(item)}
          >
            <img src={item.icon} alt={item.name} className="menu-icon" />
            <p className="menu-text">{item.name}</p>
          </div>
        ))}
      </div>
          <header className="review-header">
            <h1>REVIEW</h1>
            <div className="qwr">
        <div className="qw"></div>
        <div className="qw"></div>
        <div className="qw"></div>
        <div className="qw"></div>
        </div>  
          </header>
    
          <div className="review-content">
            <div className="rating-section">
        <div className="review-card driver-card">
        <div className="driver-card">
        <div className="driver-image-frame">
  <img
    className="driver-image"
    src="https://cdn-icons-png.flaticon.com/128/2684/2684218.png"
    alt="Driver Avatar"
  />
</div>

<p className="driver-id">Driver_ID: {driver || 'N/A'}</p>


</div>

<div className="rating-buttons">
        <button
          className={`reaction-button like ${
            feedbackOptions.includes('like') ? 'active' : ''
          }`}
          onClick={() => toggleFeedbackOption('like')}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/128/456/456115.png"
            alt="Like"
            className="reaction-icon"
          />
          Like
        </button>
        <button
          className={`reaction-button dislike ${
            feedbackOptions.includes('dislike') ? 'active' : ''
          }`}
          onClick={() => toggleFeedbackOption('dislike')}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/128/9849/9849304.png"
            alt="Dislike"
            className="reaction-icon"
          />
          Dislike
        </button>
        <button
          className={`reaction-button love ${
            feedbackOptions.includes('love') ? 'active' : ''
          }`}
          onClick={() => toggleFeedbackOption('love')}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/128/2107/2107845.png"
            alt="Love"
            className="reaction-icon"
          />
          Love
        </button>
      </div>
        <p className="rating-label">Rating</p>
        <div className="rating-stars">
  {[1, 2, 3, 4, 5].map((star) => (
    <span
      key={star}
      className={`star ${rating && rating >= star ? 'selected' : ''}`}
      onClick={() => setRating(star)} // Set the clicked star as the rating
      onMouseEnter={() => setHovered(star)} // Highlight stars on hover
      onMouseLeave={() => setHovered(null)} // Remove highlight when not hovering
    >
      ★
    </span>
  ))}
</div>
      </div>
              <textarea
                className="comment-box"
                placeholder="                    ----Comment Here----"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              ></textarea>
            </div>
    
           
            <div className="review-card feedback-card">
  <h3>Optional Feedback</h3>
  <div className="feedback-options">
  {[
    { id: "comfortable", label: "Comfortable", icon: "https://cdn-icons-png.flaticon.com/128/1703/1703123.png" },
    { id: "safety", label: "Safety", icon: "https://cdn-icons-png.flaticon.com/128/1161/1161388.png" },
    { id: "communication", label: "Communication", icon: "https://cdn-icons-png.flaticon.com/128/610/610413.png" },
    { id: "cleanliness", label: "Cleanliness", icon: "https://cdn-icons-png.flaticon.com/128/2059/2059802.png" },
  ].map((option) => (
    <button
      key={option.id}
      className={`feedback-button ${feedbackOptions.includes(option.id) ? "active" : ""}`}
      onClick={() => toggleFeedbackOption(option.id)}
    >
      <img src={option.icon} alt={option.label} className="feedback-icon" />
      {option.label}
    </button>
  ))}
</div>

  <div className="contact-info-container">
  <div className="contact-message">
  <img
    src="https://cdn-icons-png.flaticon.com/128/2058/2058197.png"
    alt="Contact Icon"
    className="contact-icon"
  />
  <p>
  If the driver was rude or if you need further assistance, please do not hesitate to contact us.:
  </p>
</div>

  <div className="contact-info-item">
    <img
      src="https://cdn-icons-png.flaticon.com/128/15047/15047587.png"
      alt="Email Icon"
      className="contact-icon"
    />
    <p>Email: <a href="mailto:Cabana@email.com">Cabana@email.com</a></p>
  </div>
  <div className="contact-info-item">
    <img
      src="https://cdn-icons-png.flaticon.com/128/724/724664.png"
      alt="Phone Icon"
      className="contact-icon"
    />
    <p>Tel: 098-456-3211</p>
  </div>
</div>

</div>


<div className="review-card passenger-card">
  <div className="passenger-image-frame">
    <img
      className="passenger-image"
      src="https://cdn-icons-png.flaticon.com/128/1611/1611733.png"
      alt="Passenger Avatar"
    />
  </div>
  <div className="passenger-details">
    <p className="passenger-title">Review BY</p>
    <p className="passenger-id">Passenger_ID: {passenger || 'N/A'}</p>
  </div>
</div>


      </div>
    
          <div className="button-container">
            <button className="primary-btn" onClick={handleSubmit}>
              Submit Review
            </button>
            <button className="review-later-btn" onClick={handleReviewLater}>
          Review Later
        </button>
          </div>
        </div>
        </div>
      );
    };
export default  Review;
