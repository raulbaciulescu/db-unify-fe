import CryptoJS from 'crypto-js';

// Cheia de criptare - în producție ar trebui să fie în variabile de mediu
const ENCRYPTION_KEY = 'db-unify-secret-key-202_';

/**
 * Criptează o parolă folosind AES
 */
export const encryptPassword = (password: string): string => {
    try {
        const encrypted = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error('Error encrypting password:', error);
        throw new Error('Failed to encrypt password');
    }
};

/**
 * Decriptează o parolă criptată cu AES
 */
export const decryptPassword = (encryptedPassword: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted;
    } catch (error) {
        console.error('Error decrypting password:', error);
        throw new Error('Failed to decrypt password');
    }
};

/**
 * Creează un hash SHA256 al parolei pentru verificări
 */
export const hashPassword = (password: string): string => {
    try {
        const hash = CryptoJS.SHA256(password).toString();
        return hash;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
};

/**
 * Verifică dacă o parolă în text clar se potrivește cu un hash
 */
export const verifyPassword = (password: string, hash: string): boolean => {
    try {
        const passwordHash = hashPassword(password);
        return passwordHash === hash;
    } catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
};