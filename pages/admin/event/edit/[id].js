import { useState, useEffect } from 'react';
import { db } from '../../../../firebaseConfig'; // Adjust path if needed
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Layout from '../../../../component/Layout';
import "../../../../src/app/styles/main.scss";

const EditEvent = () => {
  const router = useRouter();
  const { id } = router.query;

  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState(''); // Start Date/Time
  const [endTime, setEndTime] = useState('');     // End Date/Time
  const [productList, setProductList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        try {
          const eventDoc = doc(db, 'LeadCapture', id);
          const eventSnapshot = await getDoc(eventDoc);
          if (eventSnapshot.exists()) {
            const data = eventSnapshot.data();
            setEventName(data.name || '');
            setEventTime(data.time ? new Date(data.time.seconds * 1000).toISOString().slice(0, 16) : '');
            setEndTime(data.endTime ? new Date(data.endTime.seconds * 1000).toISOString().slice(0, 16) : '');
            setProductList(Array.isArray(data.productList) ? data.productList : []);
          } else {
            setError('Event not found.');
          }
        } catch {
          setError('Error fetching event details.');
        } finally {
          setLoading(false);
        }
      };

      fetchEvent();
    }
  }, [id]);

  const handleAddProduct = () => setProductList([...productList, '']);
  const handleProductChange = (index, val) => {
    const updated = [...productList];
    updated[index] = val;
    setProductList(updated);
  };
  const handleRemoveProduct = (index) => {
    const updated = [...productList];
    updated.splice(index, 1);
    setProductList(updated);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();

    if (!eventName || !eventTime || !endTime) {
      setError('Please fill in all required fields.');
      return;
    }

    if (productList.some(p => !p.trim())) {
      setError('Please fill all product fields or remove empty ones.');
      return;
    }

    try {
      const eventDocRef = doc(db, 'LeadCapture', id);
      await updateDoc(eventDocRef, {
        name: eventName,
        time: Timestamp.fromDate(new Date(eventTime)),
        endTime: Timestamp.fromDate(new Date(endTime)),
        productList: productList,
      });

      setSuccess('Event updated successfully!');
      router.push('/admin/event/manageEvent');
    } catch {
      setError('Error updating event. Please try again.');
    }
  };

  return (
    <Layout>
      <section className='c-form box'>
        <h2>Edit Event</h2>
        <button className="m-button-5" onClick={() => window.history.back()}>Back</button>
        {loading ? (
          <p>Loading event details...</p>
        ) : (
          <form onSubmit={handleUpdateEvent}>
            <ul>
              <li className='form-row'>
                <h4>Event Name</h4>
                <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} required />
              </li>
              <li className='form-row'>
                <h4>Start Date & Time</h4>
                <input type="datetime-local" value={eventTime} onChange={(e) => setEventTime(e.target.value)} required />
              </li>
              <li className='form-row'>
                <h4>End Date & Time</h4>
                <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </li>
      
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {success && <p style={{ color: 'green' }}>{success}</p>}
 <li className='form-row'>
            <h4>Product List<sup>*</sup></h4>
            <div className='multipleitem'>
              {productList.map((product, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <textarea
                    value={product}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    placeholder={`Product ${index + 1}`}
                    required
                    rows={3}
                    style={{ width: '300px', marginRight: '10px' }}
                  />
                  {productList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(index)}
                      style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddProduct} className="submitbtn" style={{ marginTop: '5px' }}>
                + Add Product
              </button>
            </div>
          </li>

          <li className='form-row'>
            <div>
                       <button className='submitbtn' type='submit'>Update</button>
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
