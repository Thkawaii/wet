import React, { useState, useEffect } from "react";
import "./payment.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import TrueMoneyQR from "../../assets/2.png";
import PromptPayQR from "../../assets/3.png";
import AlipayQR from "../../assets/4.png";
import LinePayQR from "../../assets/5.png";
import VisaIcon from "../../assets/visa.png";
import MasterCardIcon from "../../assets/mastercard.png";
import AmexIcon from "../../assets/amex.png";
import JCBIcon from "../../assets/jcb.png";
import DiscoverIcon from "../../assets/discover.png";
import DinersIcon from "../../assets/diners.png";
import UnionPayIcon from "../../assets/unionpay.png";
import OtherCardIcon from "../../assets/OtherCard.png";
import { apiRequest } from "../../config/ApiService";
import { Endpoint } from "../../config/Endpoint";

const Payment: React.FC = () => {
  const [method, setMethod] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  const [cardType, setCardType] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [wallet, setWallet] = useState<string | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const location = useLocation();
  const { paymenyAmount, promotionId, bookingId, driverId, passengerId } =
    location.state || {};

  useEffect(() => {
    setWallet(null);
    setCardDetails({
      cardNumber: "",
      cardholderName: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
    });
    setErrors({});
    setError("");
  }, [method]);

  const handleCardInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const numericValue = value.replace(/\D/g, "");
      const formattedValue =
        numericValue
          .match(/.{1,4}/g)
          ?.join("-")
          .substr(0, 19) || "";
      setCardDetails((prev) => ({ ...prev, [name]: formattedValue }));
      detectCardType(numericValue);
    } else {
      setCardDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const detectCardType = (cardNumber: string) => {
    if (/^4/.test(cardNumber)) {
      setCardType("Visa");
    } else if (/^5[1-5]/.test(cardNumber)) {
      setCardType("MasterCard");
    } else if (/^3[47]/.test(cardNumber)) {
      setCardType("Amex");
    } else if (/^(?:2131|1800|35)/.test(cardNumber)) {
      setCardType("JCB");
    } else if (/^6(?:011|5)/.test(cardNumber)) {
      setCardType("Discover");
    } else if (/^3(?:0[0-5]|[68])/.test(cardNumber)) {
      setCardType("Diners");
    } else if (/^62/.test(cardNumber)) {
      setCardType("UnionPay");
    } else {
      setCardType("OtherCard");
    }
  };

  // const menuItems = [
  //   {
  //     name: "Home",
  //     icon: "https://cdn-icons-png.flaticon.com/128/18390/18390765.png",
  //     route: "/paid",
  //   },
  //   {
  //     name: "Payment",
  //     icon: "https://cdn-icons-png.flaticon.com/128/18209/18209461.png",
  //     route: "/payment",
  //   },
  //   {
  //     name: "Review",
  //     icon: "https://cdn-icons-png.flaticon.com/128/7656/7656139.png",
  //     route: "/review",
  //   },
  //   {
  //     name: "History",
  //     icon: "https://cdn-icons-png.flaticon.com/128/9485/9485945.png",
  //     route: "/review/history",
  //   },
  // ];

  const validateForm = () => {
    const validationErrors: { [key: string]: string } = {};

    const cardNumberRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/;

    if (!cardNumberRegex.test(cardDetails.cardNumber)) {
      validationErrors.cardNumber =
        "Card Number must be in XXXX-XXXX-XXXX-XXXX format.";
    }

    if (!cardDetails.cardholderName.trim().includes(" ")) {
      validationErrors.cardholderName =
        "Please enter a valid first and last name.";
    }

    if (!cardDetails.expiryMonth) {
      validationErrors.expiryMonth = "Please select an expiry month.";
    }

    if (!cardDetails.expiryYear) {
      validationErrors.expiryYear = "Please select an expiry year.";
    }

    const cvvRegex = /^\d{3,4}$/;
    if (!cvvRegex.test(cardDetails.cvv)) {
      validationErrors.cvv = "CVV must be exactly 3 or 4 numeric digits.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleConfirm = async () => {
    try {
      if (!bookingId || !passengerId || !driverId) {
        alert("Please check the information on the home page first.");
        return;
      }

      if (!paymenyAmount || !bookingId) {
        setError("Invalid payment data. Please try again.");
        return;
      }

      if (!method) {
        setError("Please Select Payment Method.");
        return;
      }

      let card: string = "";

      if (method === "wallet") {
        if (!wallet) {
          setError("Please Select Wallet Payment.");
          return;
        } else {
          setError("");
        }
      } else if (method === "card") {
        if (!validateForm()) {
          return;
        } else {
          card = `?card_type=${cardType}`;
        }
      }

      const paymentData = {
        payment_amount: paymenyAmount,
        payment_method: method === "wallet" ? wallet : cardType,
        booking_id: bookingId,
        promotion_id: promotionId === undefined ? null : promotionId,
      };

      const response = await apiRequest(
        "POST",
        Endpoint.PAYMENT + card,
        paymentData
      );

      if (promotionId != undefined || promotionId != null) {
        await apiRequest(
          "PUT",
          `${Endpoint.PROMOTION_USECOUNT}?promotion_id=${promotionId}`
        );
      }

      if (response) {
        alert("Payment successfully!");
        navigate("/review", {
          state: {
            bookingId: bookingId,
            driverId: driverId,
            passengerId: passengerId,
          },
        });
      } else {
        setError("Payment failed. Please try again.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(`An error occurred: ${error.message}`);
      } else {
        setError("An unknown error occurred.");
      }
      console.error("Error during payment:", error);
    }
  };

  // const handleMenuClick = (item: {
  //   name: string;
  //   icon: string;
  //   route: string;
  // }) => {
  //   navigate(item.route);
  // };

  const cardTypeIcons = {
    Visa: VisaIcon,
    MasterCard: MasterCardIcon,
    Amex: AmexIcon,
    JCB: JCBIcon,
    Discover: DiscoverIcon,
    Diners: DinersIcon,
    UnionPay: UnionPayIcon,
    OtherCard: OtherCardIcon,
  };

  return (
    <div className="nn">
      <div className="payment-container1">
        <video autoPlay muted loop className="bm">
          <source
            src="https://media.istockphoto.com/id/1293937827/th/%E0%B8%A7%E0%B8%B4%E0%B8%94%E0%B8%B5%E0%B9%82%E0%B8%AD/%E0%B8%82%E0%B8%B1%E0%B8%9A%E0%B8%A3%E0%B8%96%E0%B8%AD%E0%B8%B8%E0%B9%82%E0%B8%A1%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%AE%E0%B8%AD%E0%B8%A5%E0%B9%81%E0%B8%A5%E0%B8%99%E0%B8%94%E0%B9%8C%E0%B8%88%E0%B8%B2%E0%B8%81%E0%B9%81%E0%B8%A1%E0%B8%99%E0%B8%AE%E0%B8%B1%E0%B8%95%E0%B8%95%E0%B8%B1%E0%B8%99%E0%B9%84%E0%B8%9B%E0%B9%80%E0%B8%88%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B8%8B%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%8B%E0%B8%B4%E0%B8%95%E0%B8%B5%E0%B9%89%E0%B9%82%E0%B8%94%E0%B8%A2%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B8%A1%E0%B8%B5%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%88%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%A3-%E0%B8%A1%E0%B8%B8%E0%B8%A1%E0%B8%A1%E0%B8%AD%E0%B8%87%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%9C%E0%B8%B9%E0%B9%89%E0%B8%82%E0%B8%B1%E0%B8%9A%E0%B8%82%E0%B8%B5%E0%B9%88.mp4?s=mp4-640x640-is&k=20&c=kdB31F7tkd1SQl0AybWQSweLq8tbCKL9xOO6cuK0EZA="
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        <header className="payment-header">
          {/* <div className="sidebar">
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
          </div> */}
          <h1>PAYMENT</h1>
          <div className="step-indicators">
            <div className="step completed"></div>
            <div className="step active"></div>
            <div className="step"></div>
          </div>
        </header>
        <div className="payment-options">
          <div
            className={`payment-option ${method === "card" ? "selected" : ""}`}
            onClick={() => setMethod("card")}
          >
            <p>Credit/Debit Card</p>
            <div className="image-row">
              <img
                src="https://cdn-icons-png.flaticon.com/128/349/349221.png"
                alt="Image 1"
                className="image-item"
              />
              <img
                src="https://cdn-icons-png.flaticon.com/128/16174/16174534.png"
                alt="Image 2"
                className="image-item"
              />
              <img
                src="https://cdn-icons-png.flaticon.com/128/311/311147.png"
                alt="Image 3"
                className="image-item"
              />
            </div>
          </div>
          <div
            className={`payment-option ${
              method === "wallet" ? "selected" : ""
            }`}
            onClick={() => setMethod("wallet")}
          >
            <p>Digital Wallet</p>
            <img
              src="https://cdn-icons-png.flaticon.com/128/2335/2335451.png"
              alt="Digital Wallet"
              className="payment-option-img"
            />
          </div>
        </div>
        <div>
          {error && <div className="error-message">{error}</div>}
          {/* Wallet Options */}
          {method === "wallet" && (
            <div className="wallet-grid">
              <button
                className="wallet-btn"
                onClick={() => {
                  setWallet("truemoney");
                  setError(""); // Clear error when this wallet is selected
                }}
              >
                <img
                  src="https://play-lh.googleusercontent.com/eOzvk-ekluYaeLuvDkLb5RJ0KqfFQpodZDnppxPfpEfqEqbNo5erEkmwLBgqP-k-e2kQ"
                  alt="TrueMoney"
                />
                <span>TrueMoney</span>
              </button>
              <button
                className="wallet-btn"
                onClick={() => {
                  setWallet("promptpay");
                  setError(""); // Clear error when this wallet is selected
                }}
              >
                <img
                  src="https://www.bot.or.th/content/dam/bot/icons/icon-thaiqr.png"
                  alt="PromptPay"
                />
                <span>PromptPay</span>
              </button>
              <button
                className="wallet-btn"
                onClick={() => {
                  setWallet("alipay");
                  setError(""); // Clear error when this wallet is selected
                }}
              >
                <img
                  src="https://cdn.techinasia.com/data/images/c91cff808dad89b1dd21f6f3f433c521.png"
                  alt="Alipay"
                />
                <span>Alipay</span>
              </button>
              <button
                className="wallet-btn"
                onClick={() => {
                  setWallet("linepay");
                  setError(""); // Clear error when this wallet is selected
                }}
              >
                <img
                  src="https://d.line-scdn.net/linepay/portal/v-241028/portal/assets/img/linepay-logo-jp-gl.png"
                  alt="Line Pay"
                />
                <span>Line Pay</span>
              </button>
            </div>
          )}
        </div>
        {wallet === "truemoney" && (
          <div className="qr-code-section">
            <h2>Scan the QR Code</h2>
            <img className="qr-code-img" src={TrueMoneyQR} alt="TrueMoneyQR" />
          </div>
        )}
        {wallet === "promptpay" && (
          <div className="qr-code-section">
            <h2>Scan the QR Code</h2>
            <img className="qr-code-img" src={PromptPayQR} alt="PromptPayQR" />
          </div>
        )}
        {wallet === "alipay" && (
          <div className="qr-code-section">
            <h2>Scan the QR Code</h2>
            <img className="qr-code-img" src={AlipayQR} alt="AlipayQR" />
          </div>
        )}
        {wallet === "linepay" && (
          <div className="qr-code-section">
            <h2>Scan the QR Code</h2>
            <img className="qr-code-img" src={LinePayQR} alt="LinePayQR" />
          </div>
        )}

        {method === "card" && (
          <div className="card-details-form">
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <div
                className="card-number-input"
                style={{
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234-5678-9012-3456"
                  value={cardDetails.cardNumber}
                  onChange={handleCardInputChange}
                  style={{ flex: 1, color: "#909090" }}
                />
                {cardType && cardType in cardTypeIcons && (
                  <img
                    src={cardTypeIcons[cardType as keyof typeof cardTypeIcons]}
                    alt={cardType}
                    className="card-type-icon"
                  />
                )}
              </div>
              {errors.cardNumber && (
                <div className="error-message">{errors.cardNumber}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="cardholderName">Cardholder Name</label>
              <input
                type="text"
                id="cardholderName"
                name="cardholderName"
                placeholder="John Doe"
                value={cardDetails.cardholderName}
                style={{ color: "#909090" }}
                onChange={(e) =>
                  setCardDetails((prev) => ({
                    ...prev,
                    cardholderName: e.target.value,
                  }))
                }
              />
              {errors.cardholderName && (
                <div className="error-message">{errors.cardholderName}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="expiryMonth">Expiry Month</label>
              <select
                id="expiryMonth"
                name="expiryMonth"
                value={cardDetails.expiryMonth}
                onChange={handleCardInputChange}
                style={{ color: "#909090" }}
              >
                <option value="">Month</option>
                {[...Array(12).keys()].map((m) => (
                  <option key={m + 1} value={String(m + 1).padStart(2, "0")}>
                    {String(m + 1).padStart(2, "0")}
                  </option>
                ))}
              </select>
              {errors.expiryMonth && (
                <div className="error-message">{errors.expiryMonth}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="expiryYear">Expiry Year</label>
              <select
                id="expiryYear"
                name="expiryYear"
                value={cardDetails.expiryYear}
                onChange={handleCardInputChange}
                style={{ color: "#909090" }}
              >
                <option value="">Year</option>
                {Array.from(
                  { length: 30 },
                  (_, i) => new Date().getFullYear() + i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.expiryYear && (
                <div className="error-message">{errors.expiryYear}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                placeholder="123"
                value={cardDetails.cvv}
                onChange={handleCardInputChange}
                style={{ color: "#909090" }}
              />
              {errors.cvv && <div className="error-message">{errors.cvv}</div>}
            </div>
          </div>
        )}

        <div className="button-container">
          <button className="ax" onClick={handleConfirm}>
            Confirm
          </button>
          <button className="cx" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
export default Payment;
