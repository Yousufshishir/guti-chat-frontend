import CryptoJS from 'crypto-js';

// 🚨 সতর্কতা: বাস্তব প্রোডাকশনে এটি ইউজারের প্রাইভেট কী (Private Key) হওয়া উচিত।
// এখন টেস্টিংয়ের জন্য আমরা একটি সিক্রেট কী ব্যবহার করছি।
const SECRET_KEY = 'guti_chat_super_secret_key_123'; 

// এনক্রিপ্ট করার ফাংশন
export const encryptText = (text) => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

// ডিক্রিপ্ট করার ফাংশন
export const decryptText = (ciphertext) => {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    // যদি ডিক্রিপ্ট করা টেক্সট খালি আসে (মানে এটি আগের প্লেইন টেক্সট ছিল)
    return decryptedText || ciphertext; 
  } catch (error) {
    // যদি ডিক্রিপ্ট করতে ব্যর্থ হয় (যেমন পুরনো পোস্ট), তবে আগের লেখাটাই দেখাবে
    return ciphertext; 
  }
};