import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../firebaseConfig';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

const EventLoginPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [eventDetails, setEventDetails] = useState(null);
  const [registeredUserCount, setRegisteredUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        builder: eventDetails.builder,
        registeredAt: new Date(),
      });

      Swal.fire({
        icon: 'success',
        title: 'Thank You!',
        text: 'Thank you for registering.',
        confirmButtonColor: '#16274f',
        confirmButtonText: 'OK'
      });

      setUserName('');
      setPhoneNumber('');
      setFlatNo('');
      setWing('');

      fetchRegisteredUserCount();

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong. Please try again.',
        confirmButtonColor: '#c62828'
      });
    }
  };

  const formattedDate = eventDetails?.startTime?.seconds
    ? format(
        new Date(eventDetails.startTime.seconds * 1000),
        'EEEE, dd/MM/yy'
      )
    : '';

  const formattedStartTime = eventDetails?.startTime?.seconds
    ? format(
        new Date(eventDetails.startTime.seconds * 1000),
        'hh:mm a'
      )
    : '';

  const formattedEndTime = eventDetails?.endTime?.seconds
    ? format(
        new Date(eventDetails.endTime.seconds * 1000),
        'hh:mm a'
      )
    : '';

  return (
    <section className="feedbackContainer">
      <div className="feedback-form-container">
        <div className="client_logo">
          <img src="/ujustlogo.png" alt="Logo" />
        </div>

        <h2 className="feedback-form-title">
          {eventDetails?.name || 'Event'}
        </h2>

{formattedDate && (
  <div style={{
    textAlign: 'center',
    marginBottom: '25px',
    padding: '15px 20px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #f8f9ff, #eef2ff)',
    border: '1px solid #e0e6ff',
    fontSize: '14px',
    color: '#444',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)'
  }}>
    <div style={{
      fontWeight: '600',
      fontSize: '15px',
      color: '#16274f',
      marginBottom: '4px'
    }}>
      {formattedDate}
    </div>

    <div style={{
      fontSize: '13px',
      color: '#666',
      letterSpacing: '0.5px'
    }}>
      {formattedStartTime} - {formattedEndTime}
    </div>
  </div>
)}

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

        </form>
      </div>
    </section>
  );
};

export default EventLoginPage;
