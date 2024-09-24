import CryptoJS from 'crypto-js';
const secretKey = 'my-secret-key';

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



// Function to encrypt password
export const encryptCredentials = (password: string) => {
  return CryptoJS.AES.encrypt(password, secretKey).toString();
};

// Function to decrypt password
export const decryptCredentials = (encryptedPassword: string) => {

  const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};




