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

      // ✅ Get event name (for file naming)
      const eventRef = doc(db, 'LeadCapture', eventId);
      const eventSnap = await getDoc(eventRef);
      const eventName = eventSnap.exists()
        ? eventSnap.data().name || 'Event'
        : 'Event';

      // ✅ Correct collection path
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

      // ✅ Prepare data for Excel
      const data = snapshot.docs.map((docSnap, index) => {
        const d = docSnap.data();

        return {
          SrNo: index + 1,
          Name: d.name || '',
          PhoneNumber: d.phoneNumber || '',
          FlatNo: d.flatNo || '',
          Wing: d.wing || '',
          Builder: d.builder || '',
          RegisteredAt: d.registeredAt
            ? d.registeredAt.toDate().toLocaleString()
            : '',
        };
      });

      // ✅ Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registered Users');

      // ✅ Dynamic file name
      const today = new Date().toISOString().slice(0, 10);
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
        className="m-button-7"
        onClick={fetchDataAndExport}
        disabled={loading}
      >
        {loading ? 'Exporting...' : 'Download XLS'}
      </button>
    </div>
  );
};

export default ExportToExcel;
