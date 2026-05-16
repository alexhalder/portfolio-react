const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');

const app = express();
app.use(cors());
app.use(express.json());

// IMPORTANT: The user must provide the serviceAccountKey.json file locally, 
// or set FIREBASE_SERVICE_ACCOUNT_BASE64 in Production (Render)
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    // Production
    const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized via Environment Variable.');
  } else {
    // Local
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized via local JSON file.');
  }
} catch (error) {
  console.error('\n======================================================');
  console.error('ERROR: Missing or Invalid Firebase Credentials');
  console.error('Please provide serviceAccountKey.json locally or set the env variable.');
  console.error('======================================================\n');
}

const db = admin.apps.length ? admin.firestore() : null;

// The single admin user details for SimpleWebAuthn
const ADMIN_USER_ID = 'portfolio_admin_user_id';
const ADMIN_USERNAME = 'alexhalder2007@gmail.com'; // This should match your Firebase Auth user
const RP_NAME = 'Portfolio Admin Panel';
const RP_ID = process.env.RP_ID || 'localhost'; // In production, this will be your Vercel domain
const ORIGINS = [
    `https://${RP_ID}`, 
    `http://${RP_ID}:5173`, 
    `http://${RP_ID}:5174`, 
    `http://127.0.0.1:5173`, 
    `http://127.0.0.1:5174`
];

// Store active challenge for registration/authentication in memory
let currentChallenge = null;

// Endpoint 1: Generate Registration Challenge
app.get('/passkey/register-challenge', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Firebase not initialized' });
  
  try {
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: Buffer.from(ADMIN_USER_ID, 'utf-8'),
      userName: ADMIN_USERNAME,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
    });
    
    currentChallenge = options.challenge;
    res.json(options);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint 2: Verify Registration and Save Credential
app.post('/passkey/register-verify', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Firebase not initialized' });
  const { body } = req;
  
  try {
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: currentChallenge,
      expectedOrigin: ORIGINS,
      expectedRPID: RP_ID,
    });

    if (verification.verified && verification.registrationInfo) {
      const regInfo = verification.registrationInfo;
      console.log('Registration Info:', JSON.stringify(regInfo, (k,v) => v instanceof Uint8Array ? 'Uint8Array' : v, 2));
      
      const credentialID = regInfo.credentialID || (regInfo.credential && regInfo.credential.id);
      const credentialPublicKey = regInfo.credentialPublicKey || (regInfo.credential && regInfo.credential.publicKey);
      const counter = regInfo.counter ?? (regInfo.credential && regInfo.credential.counter) ?? 0;

      if (!credentialPublicKey) {
          throw new Error('Could not find credentialPublicKey in registrationInfo');
      }

      // Save to Firestore under 'admin_settings/passkey'
      await db.collection('admin_settings').doc('passkey').set({
        credentialID: credentialID,
        credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64'),
        counter: counter
      });

      currentChallenge = null;
      return res.json({ verified: true });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Endpoint 3: Generate Authentication Challenge
app.get('/passkey/login-challenge', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Firebase not initialized' });
  
  try {
    // Get stored credential from Firestore
    const doc = await db.collection('admin_settings').doc('passkey').get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'No passkey registered yet. Please register first.' });
    }
    
    const credential = doc.data();
    
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: [{
        id: credential.credentialID,
        type: 'public-key',
      }],
      userVerification: 'preferred',
    });

    currentChallenge = options.challenge;
    res.json(options);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint 4: Verify Authentication and Generate Firebase Custom Token
app.post('/passkey/login-verify', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Firebase not initialized' });
  const { body } = req;

  try {
    const doc = await db.collection('admin_settings').doc('passkey').get();
    if (!doc.exists) return res.status(404).json({ error: 'Passkey not found' });
    
    const credential = doc.data();

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: currentChallenge,
      expectedOrigin: ORIGINS,
      expectedRPID: RP_ID,
      credential: {
        id: credential.credentialID,
        publicKey: Buffer.from(credential.credentialPublicKey, 'base64'),
        counter: credential.counter,
      }
    });

    if (verification.verified) {
      // Update counter in Firestore to prevent replay attacks
      await db.collection('admin_settings').doc('passkey').update({
        counter: verification.authenticationInfo.newCounter
      });

      // Generate a Firebase Custom Token for the admin user!
      // Here we assume the Firebase Auth user's UID is the same as the email, or we lookup the UID.
      // Usually, you should use the actual UID of your admin user from Firebase Auth.
      // To keep it simple, we just find the user by email:
      const userRecord = await admin.auth().getUserByEmail(ADMIN_USERNAME);
      const customToken = await admin.auth().createCustomToken(userRecord.uid);
      
      currentChallenge = null;
      return res.json({ verified: true, token: customToken });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
