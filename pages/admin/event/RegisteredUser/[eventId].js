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

  // ✅ Admin form state
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [wing, setWing] = useState('');
  const [selectedBuilder, setSelectedBuilder] = useState('');
  const [eventName, setEventName] = useState('');

  useEffect(() => {
    if (!eventId) return;

    const fetchEventDetails = async () => {
      try {
        const eventRef = doc(db, 'LeadCapture', eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          const data = eventSnap.data();
          setEventName(data.name || 'LeadCapture');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
      }
    };

    const fetchRegisteredUsers = async () => {
      try {
        const registeredUsersCollection = collection(db, `LeadCapture/${eventId}/registeredUsers`);
        const snapshot = await getDocs(registeredUsersCollection);

        const users = snapshot.docs.map((docSnap, index) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            srNo: index + 1,
            name: data.name || 'N/A',
            phoneNumber: data.phoneNumber || 'N/A',
            flatNo: data.flatNo || 'N/A',
            wing: data.wing || 'N/A',
            builder: data.builder || 'N/A',
            registeredAt: data.registeredAt?.toDate().toLocaleString() || 'N/A',
          };
        });

        setRegisteredUsers(users);
      } catch (err) {
        console.error('Error fetching registered users:', err);
        setError('Failed to fetch users.');
      }
    };

    fetchEventDetails();
    fetchRegisteredUsers();
  }, [eventId, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !phoneNumber || !flatNo || !wing || !selectedBuilder) {
      setError('Please fill all fields and select a builder.');
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
        builder: selectedBuilder,
        registeredAt: Timestamp.now(),
      });

      setSuccess('User added successfully.');

      setName('');
      setPhoneNumber('');
      setFlatNo('');
      setWing('');
      setSelectedBuilder('');

      // ✅ WhatsApp Template
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
                <h4>Select Builder *</h4>
                <select
                  value={selectedBuilder}
                  onChange={(e) => setSelectedBuilder(e.target.value)}
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
              <th>Builder</th>
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
                  <td>{user.builder}</td>
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
