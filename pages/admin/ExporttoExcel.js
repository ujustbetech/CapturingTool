import { useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

const ExportToExcel = ({ eventId }) => {
  const [loading, setLoading] = useState(false);

  const fetchDataAndExport = async () => {
    setLoading(true);

    try {
      if (!eventId) {
        alert('Event ID is not available.');
        setLoading(false);
        return;
      }

      // ✅ Get event name for file naming
      const eventRef = doc(db, 'LeadCapture', eventId);
      const eventSnap = await getDoc(eventRef);
      const eventName = eventSnap.exists()
        ? eventSnap.data().name || 'Event'
        : 'Event';

      // ✅ Get registered users
      const registeredUsersCollection = collection(
        db,
        `LeadCapture/${eventId}/registeredUsers`
      );

      const snapshot = await getDocs(registeredUsersCollection);

      if (snapshot.empty) {
        alert('No registered users found for this event.');
        setLoading(false);
        return;
      }

      // ✅ Convert to array and sort by latest first
      const sortedDocs = snapshot.docs.sort((a, b) => {
        const dateA = a.data().registeredAt?.seconds || 0;
        const dateB = b.data().registeredAt?.seconds || 0;
        return dateB - dateA; // latest first
      });

      // ✅ Prepare data
      const data = sortedDocs.map((docSnap, index) => {
        const d = docSnap.data();

        let formattedDate = '';

        if (d.registeredAt) {
          const date = d.registeredAt.toDate();

          const day = date.toLocaleDateString('en-GB', {
            weekday: 'short'
          });

          const dateParts = date.toLocaleDateString('en-GB').split('/');
          const shortYear = dateParts[2].slice(-2);

          const finalDate = `${dateParts[0]}/${dateParts[1]}/${shortYear}`;

          const time = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });

          formattedDate = `${day}, ${finalDate} ${time}`;
        }

        return {
          SrNo: index + 1,
          Name: d.name || '',
          PhoneNumber: d.phoneNumber || '',
          FlatNo: d.flatNo || '',
          Wing: d.wing || '',
          Builder: d.builder || '',
          RegisteredAt: formattedDate,
        };
      });

      // ✅ Create Excel sheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registered Users');

      // ✅ File name with today date
      const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
      const fileName = `${eventName.replace(/\s+/g, '_')}_${today}.xlsx`;

      XLSX.writeFile(workbook, fileName);

      alert('Data exported successfully!');

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('An error occurred while exporting data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={fetchDataAndExport}
        disabled={loading}
        style={{
          padding: '8px 16px',
          borderRadius: '20px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: loading ? '#ccc' : '#e8f5e9',
          color: '#2e7d32',
          fontWeight: '500'
        }}
      >
        {loading ? 'Exporting...' : 'Download XLS'}
      </button>
    </div>
  );
};

export default ExportToExcel;
