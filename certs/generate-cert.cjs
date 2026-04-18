const fs = require('fs');
const path = require('path');

// Simple self-signed certificate generator for development
const { execSync } = require('child_process');

// Create certs directory if it doesn't exist
const certDir = path.join(__dirname, '../certs');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Try to use mkcert if available, otherwise fallback to OpenSSL
try {
  console.log('Attempting to generate certificate with mkcert...');
  execSync('mkcert -install', { stdio: 'inherit' });
  execSync(`mkcert -cert-file "${path.join(certDir, 'cert.pem')}" -key-file "${path.join(certDir, 'key.pem')}" localhost 127.0.0.1 ::1`, { stdio: 'inherit' });
  console.log('✅ Certificate generated with mkcert');
} catch (error) {
  console.log('mkcert not available, falling back to OpenSSL...');
  try {
    // Generate self-signed certificate with OpenSSL
    const opensslCmd = `openssl req -x509 -newkey rsa:2048 -keyout "${path.join(certDir, 'key.pem')}" -out "${path.join(certDir, 'cert.pem')}" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`;
    execSync(opensslCmd, { stdio: 'inherit' });
    console.log('✅ Self-signed certificate generated with OpenSSL');
  } catch (opensslError) {
    console.error('❌ Failed to generate certificate:', opensslError.message);
    process.exit(1);
  }
}

console.log('\n📁 Certificate files created:');
console.log(`🔑 Private Key: ${path.join(certDir, 'key.pem')}`);
console.log(`📜 Certificate: ${path.join(certDir, 'cert.pem')}`);
console.log('\n⚠️  Note: For development only. Browsers will show security warnings.');
console.log('💡 For production, use certificates from a trusted CA.');
