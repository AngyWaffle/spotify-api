const express = require('express');
const axios = require('axios');
const qs = require('qs');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/login', (req, res) => {
  const scope = 'user-read-currently-playing user-read-private';
  const authUrl = 'https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + process.env.CLIENT_ID +
    '&scope=' + encodeURIComponent(scope) +
    '&redirect_uri=' + encodeURIComponent(process.env.REDIRECT_URI);
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  
  try {
    const response = await axios.post(tokenUrl, qs.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.REDIRECT_URI,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token } = response.data;
    res.redirect(`/display?access_token=${access_token}&refresh_token=${refresh_token}`);
  } catch (error) {
    res.send('Error during token exchange: ' + error.message);
  }
});

app.get('/display', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/currently-playing', async (req, res) => {
  const { access_token } = req.query;
  
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(400).send('Error fetching currently playing track: ' + error.message);
  }
});

app.get('/user-profile', async (req, res) => {
  const { access_token } = req.query;

  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(400).send('Error fetching user profile: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
