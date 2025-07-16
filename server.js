const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const DATA_FILE = 'data.txt';

app.use(express.text());

app.post('/upload', (req, res) => {
  try {
    fs.appendFileSync(DATA_FILE, req.body + '\n---\n');
    res.status(200).send('Data received');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving data');
  }
});

app.get('/', (req, res) => {
  let data = '';
  if (fs.existsSync(DATA_FILE)) {
    data = fs.readFileSync(DATA_FILE, 'utf8');
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
        <pre>${data}</pre>
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
    console.error(err);
    res.status(500).send('Error wiping data');
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
