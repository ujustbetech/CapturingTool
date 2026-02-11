import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../firebaseConfig';
import axios from 'axios';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';


const EventLoginPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedBuilder, setSelectedBuilder] = useState('');
  const [eventDetails, setEventDetails] = useState(null);
  const [registeredUserCount, setRegisteredUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [flatNo, setFlatNo] = useState('');
  const [wing, setWing] = useState('');

  const isEventEnded =
    eventDetails?.endTime?.seconds * 1000 < Date.now();

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
    const registeredUsersRef = collection(
      db,
      'LeadCapture',
      id,
      'registeredUsers'
    );
    const snapshot = await getDocs(registeredUsersRef);
    setRegisteredUserCount(snapshot.size);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userName || !phoneNumber || !flatNo || !wing || !selectedBuilder) {
      setError('Please fill all fields and select a builder.');
      return;
    }

    try {
      const userRef = doc(
        db,
        'LeadCapture',
        id,
        'registeredUsers',
        phoneNumber
      );

      await setDoc(userRef, {
        name: userName,
        phoneNumber,
        flatNo,
        wing,
        builder: selectedBuilder,
        registeredAt: new Date(),
      });

      setSuccess('Thank you! Your response has been recorded.');

      setUserName('');
      setPhoneNumber('');
      setFlatNo('');
      setWing('');
      setSelectedBuilder('');

      fetchRegisteredUserCount();

      // ✅ WhatsApp Template Message
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
                  { type: "text", text: selectedBuilder }
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
          <img src="/ujustlogo.png" alt="Logo" />
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

          {/* ✅ Builder Dropdown */}
          <div className="input-group">
            <label>Select Builder</label>
            <select
              value={selectedBuilder}
              onChange={(e) => setSelectedBuilder(e.target.value)}
              disabled={isEventEnded}
              required
            >
              <option value="">-- Select Builder --</option>
              <option value="Lloyds Realty Developers Ltd">Lloyds Realty Developers Ltd</option>
              <option value="JE & VEE Infrastructure">JE & VEE Infrastructure</option>
              <option value="Navish Realty">Navish Realty</option>
              <option value="Right Channel Constructions">Right Channel Constructions</option>
              <option value="Shree Naman Developers Pvt Ltd">Shree Naman Developers Pvt Ltd</option>
              <option value="Sahakar Global Ltd">Sahakar Global Ltd</option>
              <option value="Evershine Builders Pvt Ltd">Evershine Builders Pvt Ltd</option>
              <option value="Ashwin Sheth Group">Ashwin Sheth Group</option>
            </select>
          </div>

          <button
            className="submitbtns"
            type="submit"
            disabled={isEventEnded}
          >
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
