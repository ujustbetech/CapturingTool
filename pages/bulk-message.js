import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import axios from "axios";

const BulkMessage = () => {
  const [sending, setSending] = useState(false);
  const [log, setLog] = useState([]);

  const sendMessages = async () => {
    setSending(true);
    setLog([]);

    try {
      const usersSnapshot = await getDocs(collection(db, "Users"));

      for (const doc of usersSnapshot.docs) {
        const user = doc.data();
        const rawPhone = String(user.phone || "").trim();
        const name = user.firstName || "there";

        // Format phone (remove spaces, special chars)
        const phone = rawPhone.replace(/[^\d+]/g, "");

        if (!phone || phone.length < 10) {
          setLog(prev => [...prev, `❌ Skipped invalid number: ${rawPhone}`]);
          continue;
        }

const payload = {
  messaging_product: "whatsapp",
  to: phone,
  type: "template",
  template: {
    name: "bulk_messaging",
    language: { code: "en" },
    components: [
      {
        type: "header",
        parameters: [
          {
            type: "image",
            image: {
              link: "https://firebasestorage.googleapis.com/v0/b/monthlymeetingapp.appspot.com/o/mantra.jpg?alt=media&token=90820d5b-d56c-4d21-b2e9-503f0927cc31"
            }
          }
        ]
      },
      {
        type: "body",
        parameters: [
          { type: "text", text: name }  // This matches your {{1}} variable
        ]
      }
      // ⚠️ No button component needed if it's a static link
    ]
  }
};


        try {
          const res = await axios.post(
            "https://graph.facebook.com/v22.0/527476310441806/messages",
            payload,
            {
              headers: {
                Authorization: `Bearer EAAKEGfZAV7pMBOzNQwpceyybpc3VaOZBcFMGkofz4h4ZAwUMAeouY8Q9ZB6DMyP471Sgk1kZCwv8ssqFlNICqDM9uEElrR8y6saxfXRejnduTB6LzVb0of2fZAzZB53FBv4eJTXABR0zzBHRcjtdTLjJc9pqbZBuVkc9grNOIkRYZA1gNq2hcqgWscUqDBiZCIOGfdYQZDZD`,
                "Content-Type": "application/json"
              }
            }
          );

         setLog(prev => [...prev, `📤 Message sent to ${phone} (Check delivery in WhatsApp)`]);

        } catch (err) {
          const error = err.response?.data?.error;
          const message = error?.message || "Unknown error";
          const code = error?.code || "No code";
          const type = error?.type || "No type";

          setLog(prev => [
            ...prev,
            `❌ Failed for ${phone}: [${code}] ${type} - ${message}`
          ]);

          console.error("Full error:", err.response?.data);
        }
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setLog(prev => [...prev, "❌ Error fetching user data"]);
    }

    setSending(false);
  };

  return (
    <section className="bulk-message-page">
      <h2>Send Bulk WhatsApp Message</h2>
      <button onClick={sendMessages} disabled={sending}>
        {sending ? "Sending..." : "Send Messages"}
      </button>

      <div className="message-log">
        {log.map((entry, i) => (
          <p key={i}>{entry}</p>
        ))}
      </div>
    </section>
  );
};

export default BulkMessage;
