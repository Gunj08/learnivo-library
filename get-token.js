const { google } = require('googleapis');
const http = require('http');
const url = require('url');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Generate an authentication URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // Crucial to get a refresh token
  prompt: 'consent',      // Force consent screen to guarantee refresh token
  scope: SCOPES,
});

console.log('--------------------------------------------------');
console.log('🔗 Open this URL in your browser to authorize Drive:');
console.log(authUrl);
console.log('--------------------------------------------------');

// Create a local server to receive the OAuth2 callback
const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/oauth2callback')) {
    const qs = new url.URL(req.url, `http://localhost:3000`).searchParams;
    const code = qs.get('code');
    
    if (code) {
      console.log('✅ Authorization code received!');
      res.end('<h1>Authentication successful!</h1><p>You can close this tab and check the terminal.</p>');
      
      try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('\n==================================================');
        console.log('🎉 SUCCESS! Here is your Refresh Token:');
        console.log('==================================================\n');
        console.log(tokens.refresh_token);
        console.log('\n==================================================');
        
        console.log('Closing server...');
        server.close();
        process.exit(0);
      } catch (error) {
        console.error('Error retrieving access token', error);
      }
    } else {
      res.end('Authentication failed (no code found).');
    }
  }
}).listen(3000, () => {
  console.log('Waiting for you to log in (Listening on Port 3000)...');
});
