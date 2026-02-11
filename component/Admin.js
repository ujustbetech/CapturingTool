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

      await setDoc(eventDocRef, {
        name: eventName,   // Builder name stored as event name
        builder: eventName,
        startTime: Timestamp.fromDate(new Date(eventStartTime)),
        endTime: Timestamp.fromDate(new Date(eventEndTime)),
        uniqueId: uniqueId,
      });

      const eventLink = `${window.location.origin}/events/${uniqueId}`;
      const qrImageData = await QRCode.toDataURL(eventLink);

      const qrRef = ref(storage, `qrcodes/${uniqueId}.png`);
      await uploadString(qrRef, qrImageData, 'data_url');

      const qrDownloadUrl = await getDownloadURL(qrRef);

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

          {/* ✅ Event Name Dropdown */}
          <li className='form-row'>
            <h4>Event Name<sup>*</sup></h4>
            <div className='multipleitem'>
              <select
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
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
