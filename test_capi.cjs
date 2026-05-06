const crypto = require('crypto');

async function sha256(message) {
  return crypto.createHash('sha256').update(message.trim().toLowerCase()).digest('hex');
}

(async () => {
  const META_ACCESS_TOKEN = 'EAA5BdPseaOUBRV7SAEbtws3z7JDqudc0AbW7bPFy4Dt6l61l6rjrvdVxZBq05ADs1m3hDRRo2ZAnLwoqe9E0BSzf1nOZBI6ZAp89mqvPPaJxgQShUZCYb7qcwPZCTSqRTyX7POqD7vg3ZAr6pl5yRfxAH8bzlerIQNchfpSl4Sd7A8uxBXZABbbqW8xMr8iPJQZDZD';
  const META_PIXEL_ID = '1489020932664195';

  const hashedEmail = await sha256('teste@odontoprime.com.br');
  const hashedPhone = await sha256('5511999999999');

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'system_generated',
        user_data: {
          client_ip_address: '127.0.0.1',
          client_user_agent: 'Odonto Dash Test Client',
          em: [hashedEmail],
          ph: [hashedPhone],
          fn: [await sha256('Cliente')],
          ln: [await sha256('Teste')]
        },
        custom_data: {
          currency: 'BRL'
        }
      }
    ],
    test_event_code: 'TEST12706'
  };

  console.log("Sending payload to Meta...");

  const metaApiUrl = `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`;
  
  const response = await fetch(metaApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  console.log("META RESPONSE:", JSON.stringify(result, null, 2));
})();
