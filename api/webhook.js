export default async function handler(req, res) {
  // Configurações básicas de CORS para permitir a chamada
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: 'Nenhuma URL de webhook fornecida' });
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    // Alguns webhooks do n8n retornam apenas texto simples (ex: "Workflow was started")
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return res.status(response.status).json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
