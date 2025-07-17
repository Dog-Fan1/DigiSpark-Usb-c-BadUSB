const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const DATA_FILE = path.resolve(__dirname, 'data.txt');

app.use(express.text({ type: '*/*' })); // Accept any text-type body

// Escape HTML characters to prevent XSS
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => {
    const escapeChars = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return escapeChars[char];
  });
}

app.post('/upload', (req, res) => {
  try {
    const body = req.body?.trim();
    if (!body) {
      return res.status(400).send('Empty body');
    }
    fs.appendFileSync(DATA_FILE, body + '\n---\n');
    res.status(200).send('Data received');
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('Error saving data');
  }
});

app.get('/', (req, res) => {
  let data = '';
  try {
    if (fs.existsSync(DATA_FILE)) {
      data = fs.readFileSync(DATA_FILE, 'utf8');
    }
  } catch (err) {
    console.error('Read error:', err);
    data = 'Error reading data.';
  }

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Collected Data</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 2rem; }
          pre { background: #f4f4f4; padding: 1rem; border-radius: 5px; white-space: pre-wrap; max-height: 60vh; overflow-y: scroll; }
          button { padding: 0.5rem 1rem; font-size: 1rem; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>Collected Data</h1>
        <pre>${escapeHtml(data)}</pre>
        <form method="POST" action="/wipe" onsubmit="return confirm('Are you sure you want to clear all data?');">
          <button type="submit">Wipe Data</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/wipe', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
    res.redirect('/');
  } catch (err) {
    console.error('Wipe error:', err);
    res.status(500).send('Error wiping data');
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
