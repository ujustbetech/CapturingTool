import { useEffect, useState } from 'react';

export default function MessagePanel() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch('/api/webhook');
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Live WhatsApp Messages</h1>
      <ul>
        {messages.map((m, i) => (
          <li key={i}>
            <b>{m.from}:</b> {m.text} <em>({new Date(m.timestamp).toLocaleTimeString()})</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
