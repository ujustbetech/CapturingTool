import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../firebaseConfig';
import axios from 'axios';

import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import '../feedback.css';

const EventLoginPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);
  const [registeredUserCount, setRegisteredUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ New fields
  const [flatNo, setFlatNo] = useState('');
  const [wing, setWing] = useState('');

  const isEventEnded = eventDetails?.endTime?.seconds * 1000 < Date.now();

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      fetchRegisteredUserCount();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    const eventRef = doc(db, 'LeadCapture', id);
    const eventDoc = await getDoc(eventRef);
    if (eventDoc.exists()) {
      setEventDetails(eventDoc.data());
    }
    setLoading(false);
  };

  const fetchRegisteredUserCount = async () => {
    const registeredUsersRef = collection(db, 'LeadCapture', id, 'registeredUsers');
    const snapshot = await getDocs(registeredUsersRef);
    setRegisteredUserCount(snapshot.size);
  };

  const handleProductSelection = (product) => {
    setSelectedProducts(prev =>
      prev.includes(product)
        ? prev.filter(p => p !== product)
        : [...prev, product]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userName || !phoneNumber || !flatNo || !wing || selectedProducts.length === 0) {
      setError('Please fill all fields and select at least one product.');
      return;
    }

    try {
      const userRef = doc(db, 'LeadCapture', id, 'registeredUsers', phoneNumber);

      await setDoc(userRef, {
        name: userName,
        phoneNumber,
        flatNo,
        wing,
        selectedProducts,
        registeredAt: new Date(),
      });

      setSuccess('Thank you! Your response has been recorded.');

      // Reset fields
      setUserName('');
      setPhoneNumber('');
      setFlatNo('');
      setWing('');
      setSelectedProducts([]);

      fetchRegisteredUserCount();

      // ✅ Send WhatsApp message
      await axios.post(
        `https://graph.facebook.com/v19.0/712485631939049/messages`,
        {
          messaging_product: "whatsapp",
          to: phoneNumber,
          type: "template",
          template: {
            name: "oremeet_thankyoumessage",
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: userName },
                  { type: "text", text: eventDetails?.name || "the event" },
                  { type: "text", text: selectedProducts.join(', ') || "None" }
                ]
              }
            ]
          }
        },
        {
          headers: {
            Authorization: `Bearer YOUR_ACCESS_TOKEN`,
            "Content-Type": "application/json"
          }
        }
      );

    } catch (err) {
      console.error(err);
      setError('Error submitting form. Please try again.');
    }
  };

  return (
    <section className="feedbackContainer">
      <div className="feedback-form-container">
        <div className="client_logo">
          <img src="/mantra_logo.png" alt="Logo" />
        </div>

        <h2 className="feedback-form-title">
          {eventDetails?.name || 'Event'}
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={isEventEnded}
              required
            />
          </div>

          <div className="input-group">
            <label>Contact Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isEventEnded}
              required
            />
          </div>

          {/* ✅ Flat No Field */}
          <div className="input-group">
            <label>Flat No</label>
            <input
              type="text"
              value={flatNo}
              onChange={(e) => setFlatNo(e.target.value)}
              disabled={isEventEnded}
              required
            />
          </div>

          {/* ✅ Wing Field */}
          <div className="input-group">
            <label>Wing</label>
            <input
              type="text"
              value={wing}
              onChange={(e) => setWing(e.target.value)}
              disabled={isEventEnded}
              required
            />
          </div>

          <div className="input-group">
            <label>Select Products</label>
            <div className="checkbox-group">
              {eventDetails?.productList?.length > 0 ? (
                eventDetails.productList.map((product, idx) => (
                  <div className="checkbox-item" key={idx}>
                    <input
                      type="checkbox"
                      id={`product-${idx}`}
                      value={product}
                      checked={selectedProducts.includes(product)}
                      onChange={() => handleProductSelection(product)}
                      disabled={isEventEnded}
                    />
                    <label htmlFor={`product-${idx}`}>{product}</label>
                  </div>
                ))
              ) : (
                <p>No products listed for this event.</p>
              )}
            </div>
          </div>

          <button className="submitbtns" type="submit" disabled={isEventEnded}>
            Submit
          </button>

          {isEventEnded && (
            <p style={{ color: 'gray' }}>
              Registration is closed. The event has ended.
            </p>
          )}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
        </form>
      </div>
    </section>
  );
};

export default EventLoginPage;
