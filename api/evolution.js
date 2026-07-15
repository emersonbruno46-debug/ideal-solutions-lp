export default async function handler(req, res) {
  const evolutionUrl = process.env.VITE_EVOLUTION_API_URL;
  const apikey = process.env.VITE_EVOLUTION_API_KEY;

  if (!evolutionUrl || !apikey) {
    return res.status(500).json({ error: 'Configuração da Evolution API ausente no Vercel. Verifique as variáveis VITE_EVOLUTION_API_URL e VITE_EVOLUTION_API_KEY.' });
  }

  // Normalizar URL e Path
  let path = req.query.path || '';
  if (path && !path.startsWith('/')) path = '/' + path;
  const cleanUrl = evolutionUrl.endsWith('/') ? evolutionUrl.slice(0, -1) : evolutionUrl;
  const targetUrl = `${cleanUrl}${path}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': apikey.trim() // Garante que não tenha espaços acidentais
      }
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    // Log para o Dashboard da Vercel (ajuda a debugar)
    console.log(`[Proxy] ${req.method} -> ${targetUrl} (Key prefix: ${apikey.substring(0, 3)}...)`);

    const response = await fetch(targetUrl, fetchOptions);
    
    // Evitar cache de erros
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    return res.status(response.status).json(data);
  } catch (e) {
    console.error(`[Proxy Error] ${e.message}`);
    return res.status(500).json({ error: e.message });
  }
}
