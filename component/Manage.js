import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { FaRegCopy } from "react-icons/fa6";
import { useRouter } from 'next/router';
import { CiEdit } from "react-icons/ci";
import { GrFormView } from "react-icons/gr";

const ManageEvents = () => {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventCollection = collection(db, 'LeadCapture');
        const eventSnapshot = await getDocs(eventCollection);
        const eventList = eventSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventList);
      } catch (error) {
        console.error(error);
        setError('Error fetching events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleViewUsers = (eventId) => {
    router.push(`/admin/event/RegisteredUser/${eventId}`);
  };

  const handleEditEvent = (eventId) => {
    router.push(`/admin/event/edit/${eventId}`);
  };
const handleDeleteEvent = async (eventId, eventName) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete "${eventName}"?\n\nThis action cannot be undone.`
  );

  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, 'LeadCapture', eventId));
    setEvents(prev => prev.filter(event => event.id !== eventId));
    alert('Event deleted successfully!');
  } catch (error) {
    console.error(error);
    setError('Error deleting event.');
  }
};


  const handleCopyEventLink = (eventId) => {
    if (typeof window === "undefined") return;

    const baseUrl = window.location.origin;
    const eventLink = `${baseUrl}/events/${eventId}`;

    navigator.clipboard.writeText(eventLink)
      .then(() => alert('Event link copied!'))
      .catch(err => console.error(err));
  };

  const formatTime = (timestamp) => {
    if (timestamp?.seconds) {
      return format(new Date(timestamp.seconds * 1000), 'dd/MM/yyyy HH:mm');
    }
    return '-';
  };

  const getStatus = (endTime) => {
    if (!endTime?.seconds) return 'Unknown';
    return endTime.seconds * 1000 > Date.now() ? 'Active' : 'Expired';
  };

  const baseBtnStyle = {
    padding: '8px 16px',
    borderRadius: '25px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginRight: '8px'
  };

  return (
    <>
      {loading && (
        <div className='loader'>
          <span className="loader2"></span>
        </div>
      )}

      <section className='c-userslist box'>
        <h2>Events Listing</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <table className='table-class'>
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Builder Name</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Copy</th>
              <th>QR</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {events.map((event, index) => (
              <tr key={event.id}>
                <td>{index + 1}</td>
                <td>{event.builder || event.name}</td>
                <td>{formatTime(event.startTime)}</td>
                <td>{formatTime(event.endTime)}</td>

                <td>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '500',
                    backgroundColor:
                      getStatus(event.endTime) === 'Active'
                        ? '#d4edda'
                        : '#f8d7da',
                    color:
                      getStatus(event.endTime) === 'Active'
                        ? '#155724'
                        : '#721c24'
                  }}>
                    {getStatus(event.endTime)}
                  </span>
                </td>

                <td>
                  <button
                    onClick={() => handleCopyEventLink(event.id)}
                    style={{
                      ...baseBtnStyle,
                      backgroundColor: '#e3f2fd',
                      color: '#1565c0'
                    }}
                  >
                    <FaRegCopy /> Copy
                  </button>
                </td>

                <td>
                  {event.qrCodeUrl ? (
                    <a
                      href={event.qrCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...baseBtnStyle,
                        backgroundColor: '#e0f2f1',
                        color: '#00695c',
                        textDecoration: 'none'
                      }}
                    >
                      View QR
                    </a>
                  ) : (
                    <span style={{ color: 'gray' }}>No QR</span>
                  )}
                </td>

                <td>
                  <button
                    onClick={() => handleViewUsers(event.id)}
                    style={{
                      ...baseBtnStyle,
                      backgroundColor: '#e8eaf6',
                      color: '#3949ab'
                    }}
                  >
                    <GrFormView /> View
                  </button>

                  <button
                    onClick={() => handleEditEvent(event.id)}
                    style={{
                      ...baseBtnStyle,
                      backgroundColor: '#fff3e0',
                      color: '#ef6c00'
                    }}
                  >
                    <CiEdit /> Edit
                  </button>

                <button
  onClick={() => handleDeleteEvent(event.id, event.builder || event.name)}

                    style={{
                      ...baseBtnStyle,
                      backgroundColor: '#ffebee',
                      color: '#c62828'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default ManageEvents;
