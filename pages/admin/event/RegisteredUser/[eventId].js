import { useEffect, useState } from 'react';
import { db } from '../../../../firebaseConfig';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import Layout from '../../../../component/Layout';
import ExportToExcel from '../../../admin/ExporttoExcel';

const RegisteredUsers = () => {
  const router = useRouter();
  const { eventId } = router.query;

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [wing, setWing] = useState('');
  const [eventBuilder, setEventBuilder] = useState('');
  const [eventName, setEventName] = useState('');

  useEffect(() => {
    if (!eventId) return;

    const fetchEventDetails = async () => {
      try {
        const eventRef = doc(db, 'LeadCapture', eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          const data = eventSnap.data();
          setEventName(data.name || '');
          setEventBuilder(data.builder || data.name || '');
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchRegisteredUsers = async () => {
      try {
        const registeredUsersCollection = collection(
          db,
          `LeadCapture/${eventId}/registeredUsers`
        );

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
            fileURL: data.fileURL || '',
            registeredAt:
              data.registeredAt?.toDate().toLocaleString() || 'N/A',
          };
        });

        setRegisteredUsers(users);
      } catch (err) {
        console.error(err);
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

    if (!name.trim()) {
      setError('Please enter name.');
      return;
    }

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setError('Enter valid 10 digit phone number.');
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

    if (!eventBuilder) {
      setError('Event builder not found.');
      return;
    }

    try {
      const userRef = doc(
        db,
        'LeadCapture',
        eventId,
        'registeredUsers',
        phoneNumber
      );

      await setDoc(userRef, {
        name,
        phoneNumber,
        flatNo,
        wing,
        builder: eventBuilder,
        registeredAt: Timestamp.now(),
      });

      setSuccess('User added successfully.');

      setName('');
      setPhoneNumber('');
      setFlatNo('');
      setWing('');

    } catch (err) {
      console.error(err);
      setError('Error submitting user.');
    }
  };

  return (
    <Layout>
      <section className='c-userslist box'>

        <div
          className="header-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3>{eventName}</h3>
          <ExportToExcel eventId={eventId} />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        {/* Admin Add Form */}
        <section className='c-form box'>
          <h2>Add New Lead</h2>

          <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
            <ul>

              <li className='form-row'>
                <h4>Person Name *</h4>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </li>

              <li className='form-row'>
                <h4>Phone *</h4>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </li>

              <li className='form-row'>
                <h4>Flat No *</h4>
                <input
                  type="text"
                  value={flatNo}
                  onChange={(e) => setFlatNo(e.target.value)}
                  required
                />
              </li>

              <li className='form-row'>
                <h4>Wing *</h4>
                <input
                  type="text"
                  value={wing}
                  onChange={(e) => setWing(e.target.value)}
                  required
                />
              </li>

              <li className='form-row'>
                <h4>Builder</h4>
                <input
                  type="text"
                  value={eventBuilder}
                  disabled
                />
              </li>

              <li className='form-row'>
                <button type="submit" className="submitbtn">
                  Add User
                </button>
              </li>

            </ul>
          </form>
        </section>

        {/* Registered Users Table */}
        <table className='table-class' style={{ marginTop: '2rem' }}>
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Flat No</th>
              <th>Wing</th>
              <th>Builder</th>
              <th>Uploaded File</th>
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

                  <td>
                    {user.fileURL ? (
                      user.fileURL.includes('.pdf') ? (
                        <a
                          href={user.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#16274f', fontWeight: 600 }}
                        >
                          View PDF
                        </a>
                      ) : (
                        <a
                          href={user.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={user.fileURL}
                            alt="Uploaded"
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                            }}
                          />
                        </a>
                      )
                    ) : (
                      'No File'
                    )}
                  </td>

                  <td>{user.registeredAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">
                  No users registered for this event.
                </td>
              </tr>
            )}
          </tbody>
        </table>

      </section>
    </Layout>
  );
};

export default RegisteredUsers;
