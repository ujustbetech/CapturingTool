import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../firebaseConfig';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';

const EventLoginPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
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

    // ✅ Proper Validation
    if (!userName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setError('Please enter valid 10 digit phone number.');
      return;
    }

    if (!flatNo.trim()) {
      setError('Please enter flat number.');
      return;
    }

    if (!wing.trim()) {
      setError('Please enter wing.');
      return;
    }

    if (!eventDetails?.builder) {
      setError('Event builder not found.');
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
        builder: eventDetails.builder, // ✅ Auto from event
        registeredAt: new Date(),
      });

      setSuccess('Thank you! Your response has been recorded.');

      setUserName('');
      setPhoneNumber('');
      setFlatNo('');
      setWing('');

      fetchRegisteredUserCount();

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

          {/* ✅ Auto Display Builder */}
          <div className="input-group">
            <label>Builder</label>
            <input
              type="text"
              value={eventDetails?.builder || ''}
              disabled
            />
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
