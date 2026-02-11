import { useState } from 'react';
import { db, storage } from '../firebaseConfig'; 
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import QRCode from 'qrcode';

const CreateEvent = () => {
  const [eventName, setEventName] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    if (!eventName || !eventStartTime || !eventEndTime) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const eventRef = collection(db, 'LeadCapture');
      const uniqueId = doc(eventRef).id;
      const eventDocRef = doc(eventRef, uniqueId);

      // ✅ Save event details
      await setDoc(eventDocRef, {
        name: eventName,
        startTime: Timestamp.fromDate(new Date(eventStartTime)),
        endTime: Timestamp.fromDate(new Date(eventEndTime)),
        uniqueId: uniqueId,
      });

      // ✅ Generate QR code for event link
      const eventLink = `${window.location.origin}/events/${uniqueId}`;
      const qrImageData = await QRCode.toDataURL(eventLink);

      // ✅ Upload QR code to Firebase Storage
      const qrRef = ref(storage, `qrcodes/${uniqueId}.png`);
      await uploadString(qrRef, qrImageData, 'data_url');

      const qrDownloadUrl = await getDownloadURL(qrRef);

      // ✅ Save QR URL
      await setDoc(eventDocRef, {
        qrCodeUrl: qrDownloadUrl,
      }, { merge: true });

      setSuccess('Event created successfully!');

      setEventName('');
      setEventStartTime('');
      setEventEndTime('');
      setLoading(false);

      return router.push(`/events/${uniqueId}`);

    } catch (error) {
      console.error(error);
      setError('Error creating event. Please try again.');
      setLoading(false);
    }
  };

  return (
    <section className='c-form box'>
      <h2>Create New Event</h2>

      <form onSubmit={handleCreateEvent}>
        <ul>

          <li className='form-row'>
            <h4>Event Name<sup>*</sup></h4>
            <div className='multipleitem'>
              <input
                type="text"
                placeholder="Event Name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>
          </li>

          <li className='form-row'>
            <h4>Start Date<sup>*</sup></h4>
            <div className='multipleitem'>
              <input
                type="datetime-local"
                value={eventStartTime}
                onChange={(e) => setEventStartTime(e.target.value)}
                required
              />
            </div>
          </li>

          <li className='form-row'>
            <h4>End Date<sup>*</sup></h4>
            <div className='multipleitem'>
              <input
                type="datetime-local"
                value={eventEndTime}
                onChange={(e) => setEventEndTime(e.target.value)}
                required
              />
            </div>
          </li>

          <li className='form-row'>
            <div>
              <button className='submitbtn' type='submit' disabled={loading}>
                {loading ? 'Creating...' : 'Submit'}
              </button>
            </div>
          </li>

        </ul>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {loading && (
        <div className='loader'>
          <span className="loader2"></span>
        </div>
      )}
    </section>
  );
};

export default CreateEvent;
