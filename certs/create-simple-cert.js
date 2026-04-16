const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Create a simple self-signed certificate for development
function generateSelfSignedCert() {
  const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const cert = crypto.createCertificate({
    key: keyPair.privateKey,
    subject: {
      countryName: 'US',
      stateOrProvinceName: 'State',
      localityName: 'City',
      organizationName: 'Organization',
      commonName: 'localhost'
    },
    extensions: [
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 7, ip: '127.0.0.1' }
        ]
      }
    ],
    days: 365,
    signAlgorithm: 'sha256'
  }).sign(keyPair.privateKey);

  return {
    key: keyPair.privateKey,
    cert: cert
  };
}

// Create certs directory if it doesn't exist
const certDir = path.join(__dirname, '../certs');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Generate certificate
const { key, cert } = generateSelfSignedCert();

// Write certificate files
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

fs.writeFileSync(keyPath, key);
fs.writeFileSync(certPath, cert);

console.log('\n📁 Certificate files created:');
console.log(`🔑 Private Key: ${keyPath}`);
console.log(`📜 Certificate: ${certPath}`);
console.log('\n⚠️  Note: For development only. Browsers will show security warnings.');
console.log('💡 For production, use certificates from a trusted CA.');
