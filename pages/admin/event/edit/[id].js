import { useState, useEffect } from 'react';
import { db } from '../../../../firebaseConfig';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Layout from '../../../../component/Layout';
import "../../../../src/app/styles/main.scss";

const EditEvent = () => {
  const router = useRouter();
  const { id } = router.query;

  const [eventName, setEventName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const eventDocRef = doc(db, 'LeadCapture', id);
        const eventSnapshot = await getDoc(eventDocRef);

        if (eventSnapshot.exists()) {
          const data = eventSnapshot.data();

          setEventName(data.name || '');

          setStartTime(
            data.startTime
              ? new Date(data.startTime.seconds * 1000)
                  .toISOString()
                  .slice(0, 16)
              : ''
          );

          setEndTime(
            data.endTime
              ? new Date(data.endTime.seconds * 1000)
                  .toISOString()
                  .slice(0, 16)
              : ''
          );
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!eventName || !startTime || !endTime) {
      setError('Please fill in all required fields.');
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError('End time must be after start time.');
      return;
    }

    try {
      const eventDocRef = doc(db, 'LeadCapture', id);

      await updateDoc(eventDocRef, {
        name: eventName,
        startTime: Timestamp.fromDate(new Date(startTime)),
        endTime: Timestamp.fromDate(new Date(endTime)),
      });

      setSuccess('Event updated successfully!');

      setTimeout(() => {
        router.push('/admin/event/manageEvent');
      }, 1000);

    } catch (err) {
      console.error(err);
      setError('Error updating event. Please try again.');
    }
  };

  return (
    <Layout>
      <section className='c-form box'>
        <h2>Edit Event</h2>

        <button className="m-button-5" onClick={() => window.history.back()}>
          Back
        </button>

        {loading ? (
          <p>Loading event details...</p>
        ) : (
          <form onSubmit={handleUpdateEvent}>
            <ul>

              <li className='form-row'>
                <h4>Event Name *</h4>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                />
              </li>

              <li className='form-row'>
                <h4>Start Date & Time *</h4>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </li>

              <li className='form-row'>
                <h4>End Date & Time *</h4>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </li>

              {error && <p style={{ color: 'red' }}>{error}</p>}
              {success && <p style={{ color: 'green' }}>{success}</p>}

              <li className='form-row'>
                <div>
                  <button className='submitbtn' type='submit'>
                    Update
                  </button>
                </div>
              </li>

            </ul>
          </form>
        )}
      </section>
    </Layout>
  );
};

export default EditEvent;
