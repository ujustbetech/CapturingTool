// pages/api/webhook.js

let messages = []; // For demo/testing only — use a DB for production

export default function handler(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Webhook verification (GET)
  if (req.method === 'GET' && req.query['hub.mode']) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send('❌ Verification failed');
    }
  }

  // Show messages
  if (req.method === 'GET') {
    return res.status(200).json(messages);
  }

  // Handle incoming messages (POST)
  if (req.method === 'POST') {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      body.entry.forEach(entry => {
        entry.changes.forEach(change => {
          const message = change.value.messages?.[0];
          const contact = change.value.contacts?.[0];
          if (message && contact) {
            const msgObj = {
              from: contact.wa_id,
              text: message.text?.body || '[Non-text message]',
              timestamp: Date.now(),
            };
            messages.push(msgObj);
            console.log('📩 Received message:', msgObj);
          }
        });
      });
      return res.status(200).send('EVENT_RECEIVED');
    } else {
      return res.status(404).send('Not WhatsApp Payload');
    }
  }

  // Invalid method
  return res.status(405).send('Method Not Allowed');
}
