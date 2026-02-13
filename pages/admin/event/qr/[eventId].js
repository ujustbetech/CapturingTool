import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { format } from "date-fns";
import jsPDF from "jspdf";
import QRCode from "qrcode";

const ViewQRPage = () => {
  const router = useRouter();
  const { eventId } = router.query;

  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "LeadCapture", eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEvent(docSnap.data());
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchEvent();
  }, [eventId]);

  const formatTime = (timestamp) => {
    if (!timestamp?.seconds) return "-";
    return format(new Date(timestamp.seconds * 1000), "dd/MM/yyyy HH:mm");
  };

const downloadPDF = async () => {
  try {
    const builderName = event.builder || event.name || "QR";
    const start = formatTime(event.startTime);
    const end = formatTime(event.endTime);

    const pdf = new jsPDF();

    // Title
    pdf.setFontSize(18);
    pdf.text(builderName, 105, 20, { align: "center" });

    pdf.setFontSize(12);
    pdf.text(`Start: ${start}`, 20, 35);
    pdf.text(`End: ${end}`, 20, 45);

    // 🔥 Generate QR dynamically
    const eventLink = `${window.location.origin}/events/${eventId}`;

    const qrDataUrl = await QRCode.toDataURL(eventLink);

    pdf.addImage(qrDataUrl, "PNG", 55, 60, 100, 100);

    pdf.save(`${builderName}.pdf`);

  } catch (error) {
    console.error(error);
    alert("Failed to generate PDF.");
  }
};


  if (!event) return <p style={{ padding: "40px" }}>Loading...</p>;

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>QR Code Details</h2>

      <div
        style={{
          margin: "30px auto",
          padding: "30px",
          width: "400px",
          borderRadius: "20px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          background: "#ffffff"
        }}
      >
        <h3>{event.builder || event.name}</h3>

        <p><strong>Start:</strong> {formatTime(event.startTime)}</p>
        <p><strong>End:</strong> {formatTime(event.endTime)}</p>

        {event.qrCodeUrl ? (
          <img
            src={event.qrCodeUrl}
            alt="QR Code"
            style={{ width: "200px", marginTop: "20px" }}
          />
        ) : (
          <p style={{ color: "red" }}>No QR Available</p>
        )}
      </div>

      <button
        onClick={downloadPDF}
        style={{
          padding: "10px 25px",
          borderRadius: "25px",
          border: "none",
          background: "#1976d2",
          color: "white",
          fontWeight: "500",
          cursor: "pointer",
          marginTop: "20px"
        }}
      >
        Download PDF
      </button>
    </div>
  );
};

export default ViewQRPage;
