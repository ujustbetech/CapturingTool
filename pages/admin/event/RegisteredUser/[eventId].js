import { useEffect, useState } from 'react';
import { db } from '../../../../firebaseConfig';
import { collection, getDocs, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Layout from '../../../../component/Layout';
import "../../../../src/app/styles/main.scss";
import axios from 'axios';
import ExportToExcel from '../../../admin/ExporttoExcel';

const RegisteredUsers = () => {
  const router = useRouter();
  const { eventId } = router.query;

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [availableProducts, setAvailableProducts] = useState([]);

  // ✅ Admin form state
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [wing, setWing] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [eventName, setEventName] = useState('');

  useEffect(() => {
    if (!eventId) return;

    const fetchEventProducts = async () => {
      try {
        const eventRef = doc(db, 'LeadCapture', eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          const data = eventSnap.data();
          setAvailableProducts(Array.isArray(data.productList) ? data.productList : []);
          setEventName(data.name || 'LeadCapture');
        }
      } catch (err) {
        console.error('Error fetching event products:', err);
      }
    };

    const fetchRegisteredUsers = async () => {
      try {
        const registeredUsersCollection = collection(db, `LeadCapture/${eventId}/registeredUsers`);
        const snapshot = await getDocs(registeredUsersCollection);

        const users = snapshot.docs.map((doc, index) => {
          const data = doc.data();
          return {
            id: doc.id,
            srNo: index + 1,
            name: data.name || 'N/A',
            phoneNumber: data.phoneNumber || 'N/A',
            flatNo: data.flatNo || 'N/A',
            wing: data.wing || 'N/A',
            selectedProducts: Array.isArray(data.selectedProducts) ? data.selectedProducts : [],
            registeredAt: data.registeredAt?.toDate().toLocaleString() || 'N/A',
          };
        });

        setRegisteredUsers(users);
      } catch (err) {
        console.error('Error fetching registered users:', err);
        setError('Failed to fetch users.');
      }
    };

    fetchEventProducts();
    fetchRegisteredUsers();
  }, [eventId, success]);

  const handleProductChange = (product) => {
    setSelectedProducts((prev) =>
      prev.includes(product)
        ? prev.filter((p) => p !== product)
        : [...prev, product]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !phoneNumber || !flatNo || !wing || selectedProducts.length === 0) {
      setError('Please fill all fields and select at least one product.');
      return;
    }

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const userRef = doc(db, 'LeadCapture', eventId, 'registeredUsers', phoneNumber);

      await setDoc(userRef, {
        name,
        phoneNumber,
        flatNo,
        wing,
        selectedProducts,
        registeredAt: Timestamp.now(),
      });

      setSuccess('User added successfully.');

      setName('');
      setPhoneNumber('');
      setFlatNo('');
      setWing('');
      setSelectedProducts([]);

      // ✅ WhatsApp Message
      await axios.post(
        `https://graph.facebook.com/v19.0/712485631939049/messages`,
        {
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "template",
          template: {
            name: "oremeet_thankyoumessage",
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: name },
                  { type: "text", text: eventName || "LeadCapture" },
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
      console.error("Submit or WhatsApp error:", err.response?.data || err.message);
      setError('Error submitting or sending message.');
    }
  };

  return (
    <Layout>
      <section className='c-userslist box'>

        <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ExportToExcel eventId={eventId} />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        {/* ✅ Admin Add Form */}
        <section className='c-form box'>
          <h2>Add New Lead</h2>

          <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
            <ul>

              <li className='form-row'>
                <h4>Person Name *</h4>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </li>

              <li className='form-row'>
                <h4>Phone *</h4>
                <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
              </li>

              <li className='form-row'>
                <h4>Flat No *</h4>
                <input type="text" value={flatNo} onChange={(e) => setFlatNo(e.target.value)} required />
              </li>

              <li className='form-row'>
                <h4>Wing *</h4>
                <input type="text" value={wing} onChange={(e) => setWing(e.target.value)} required />
              </li>

              <li className='form-row'>
                <h4>Select Products *</h4>

                {availableProducts.length > 0 ? (
                  availableProducts.map((product) => (
                    <label key={product} style={{ marginRight: '10px' }}>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product)}
                        onChange={() => handleProductChange(product)}
                      />
                      {product}
                    </label>
                  ))
                ) : (
                  <p>No products available.</p>
                )}
              </li>

              <li className='form-row'>
                <button type="submit" className="submitbtn">Add User</button>
              </li>

            </ul>
          </form>
        </section>

        {/* ✅ Registered Users Table */}
        <table className='table-class' style={{ marginTop: '2rem' }}>
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Flat No</th>
              <th>Wing</th>
              <th>Selected Products</th>
              <th>Registered At</th>
            </tr>
          </thead>

          <tbody>
            {registeredUsers.length > 0 ? (
              registeredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.srNo}</td>
                  <td>{user.name}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.flatNo}</td>
                  <td>{user.wing}</td>
                  <td>{user.selectedProducts.join(', ') || 'N/A'}</td>
                  <td>{user.registeredAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No users registered for this event.</td>
              </tr>
            )}
          </tbody>
        </table>

      </section>
    </Layout>
  );
};

export default RegisteredUsers;
