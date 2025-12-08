import crypto from 'crypto';

/**
 * Encryption utilities for sensitive data like API keys
 * Uses AES-256-GCM with a secret key from environment variables
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Gets the encryption key from environment variables
 * The key should be a 64-character hex string (32 bytes)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY is not set in environment variables. ' +
      'Generate one with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    );
  }

  // Convert hex string to buffer
  if (key.length !== KEY_LENGTH * 2) {
    throw new Error(
      `ENCRYPTION_KEY must be ${KEY_LENGTH * 2} hex characters (${KEY_LENGTH} bytes). ` +
      'Generate a new one with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    );
  }

  return Buffer.from(key, 'hex');
}

/**
 * Encrypts a plaintext secret using AES-256-GCM
 * @param plaintext - The secret to encrypt (e.g., API key)
 * @returns Base64-encoded string containing IV + ciphertext + auth tag
 */
export function encryptSecret(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty string');
  }

  const key = getEncryptionKey();
  
  // Generate random IV
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  // Encrypt the plaintext
  let ciphertext = cipher.update(plaintext, 'utf8');
  ciphertext = Buffer.concat([ciphertext, cipher.final()]);
  
  // Get authentication tag
  const authTag = cipher.getAuthTag();
  
  // Combine IV + ciphertext + authTag and encode as base64
  const combined = Buffer.concat([iv, ciphertext, authTag]);
  return combined.toString('base64');
}

/**
 * Decrypts a ciphertext that was encrypted with encryptSecret
 * @param ciphertext - Base64-encoded string containing IV + ciphertext + auth tag
 * @returns The original plaintext secret
 */
export function decryptSecret(ciphertext: string): string {
  if (!ciphertext) {
    throw new Error('Cannot decrypt empty string');
  }

  const key = getEncryptionKey();
  
  // Decode from base64
  const combined = Buffer.from(ciphertext, 'base64');
  
  // Extract IV, ciphertext, and authTag
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH);
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  // Decrypt
  let plaintext = decipher.update(encrypted);
  plaintext = Buffer.concat([plaintext, decipher.final()]);
  
  return plaintext.toString('utf8');
}

/**
 * Validates that encryption is properly configured
 * Throws an error if ENCRYPTION_KEY is missing or invalid
 */
export function validateEncryptionSetup(): void {
  try {
    getEncryptionKey();
  } catch (error) {
    throw error;
  }
}




