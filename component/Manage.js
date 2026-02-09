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

    // Fetch all events from the 'monthlymeet' collection
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const eventCollection = collection(db, 'LeadCapture');
                const eventSnapshot = await getDocs(eventCollection);
                const eventList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setEvents(eventList);
            } catch (error) {
                console.error('Error fetching events:', error);
                setError('Error fetching events. Please try again.');
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
        router.push(`/admin/event/edit/${eventId}`); // Navigate to edit page
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await deleteDoc(doc(db, 'LeadCapture', eventId));
            setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            alert('Event deleted successfully!');
        } catch (error) {
            console.error('Error deleting event:', error);
            setError('Error deleting event. Please try again.');
        }
    };

    const handleCopyEventLink = (eventId) => {
        const eventLink = `https://lead-capturing-tool.vercel.app/events/${eventId}`;
        navigator.clipboard.writeText(eventLink).then(() => {
            alert('Event link copied to clipboard!');
        }).catch(err => {
            console.error('Error copying event link:', err);
        });
    };

    const formatTime = (timestamp) => {
        if (timestamp && timestamp.seconds) {
            return format(new Date(timestamp.seconds * 1000), 'dd/MM/yyyy HH:mm');
        }
        return 'Invalid time';
    };
const handleDownloadQR = async (url, eventName) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `QR_${eventName}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    alert('Could not download QR code. Please check the link.');
  }
};

    return (
        <>
          {loading && <div className='loader'> <span className="loader2"></span> </div>}
            <section className='c-userslist box'>
                <h2>Events Listing</h2>
                <button className="m-button-5" onClick={() => window.history.back()}>
                    Back
                </button>
                <table className='table-class'>
                  
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    
                    {/* Event Table */}
                    <thead>
                        <tr>
                            <th>Sr no</th>
                            <th>Event Name</th>
                            <th>Time</th>
                           
                            <th>Copy Event Link</th> 
                            <th>QR Code</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                 <tbody>
  {events.map((event, index) => (
    <tr key={event.id}>
      <td>{index + 1}</td>
      <td>{event.name}</td>
      <td>{formatTime(event.startTime)}</td>
      <td>
        <button 
          className="m-button-7" 
          onClick={() => handleCopyEventLink(event.id)} 
          style={{ marginLeft: '10px', backgroundColor: '#e2e2e2', color: 'black' }}
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
  className="m-button-7"
  style={{ backgroundColor: '#16274f', color: 'white', textDecoration: 'none' }}
>
  View QR
</a>


  ) : (
    <span style={{ color: 'gray' }}>No QR</span>
  )}
</td>

      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
        <div className="twobtn">
          <button className="m-button-7" onClick={() => handleViewUsers(event.id)} style={{ marginLeft: '10px', backgroundColor: '#e2e2e2', color: 'black' }}><GrFormView />View</button>
          <button className="m-button-7" onClick={() => handleEditEvent(event.id)} style={{ marginLeft: '10px', backgroundColor: '#f16f06', color: 'white' }}><CiEdit />Edit</button>
        </div>
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
