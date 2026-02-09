import { useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
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

      // Reference to the registeredUsers subcollection for the event
      const registeredUsersCollection = collection(db, `OREMeet/${eventId}/registeredUsers`);
      const snapshot = await getDocs(registeredUsersCollection);

      if (snapshot.empty) {
        alert('No registered users found for this event.');
        setLoading(false);
        return;
      }

      // Prepare data for export
      const data = snapshot.docs.map((doc, index) => {
        const d = doc.data();

        return {
          SrNo: index + 1,
          Name: d.name || '',
          PhoneNumber: d.phoneNumber || '',
          RegisteredAt: d.registeredAt ? d.registeredAt.toDate().toLocaleString() : '',
          SelectedProducts: Array.isArray(d.selectedProducts) ? d.selectedProducts.join(', ') : '',
        };
      });

      if (data.length === 0) {
        alert('No user details available for export.');
        setLoading(false);
        return;
      }

      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registered Users');

      // Write to file
      XLSX.writeFile(workbook, 'Registered_Users.xlsx');

      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error fetching data from Firestore:', error);
      alert('An error occurred while fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="m-button-7" onClick={fetchDataAndExport} disabled={loading}>
        {loading ? 'Exporting...' : 'Download XLS'}
      </button>
    </div>
  );
};

export default ExportToExcel;
