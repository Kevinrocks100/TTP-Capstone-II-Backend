const crypto = require("crypto");
const encryptionKey = process.env.ENCRYPTION_KEY;

function encrypt(text) {
    const iv = crypto.randomBytes(12); // Initialization Vector (IV)
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex'), iv);
  
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
  
    const tag = cipher.getAuthTag(); // Get the authentication tag
  
    // Combine the IV, encrypted data, and authentication tag for storage
    return iv.toString('hex') + encrypted + tag.toString('hex');
}
  
function decrypt(encryptedText) {
    const iv = Buffer.from(encryptedText.slice(0, 24), 'hex');
    const encryptedData = encryptedText.slice(24, -32);
    const tag = Buffer.from(encryptedText.slice(-32), 'hex');
  
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex'), iv);
    decipher.setAuthTag(tag); // Set the authentication tag
  
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
  
    return decrypted;
}
  
module.exports = { encrypt, decrypt };