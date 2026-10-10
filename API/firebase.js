import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA3l0KxRC7MhOL2Wqi-E0gV-yugfuCI8Gw",
    authDomain: "bico-23171.firebaseapp.com",
    projectId: "bico-23171",
    storageBucket: "bico-23171.firebasestorage.app",
    messagingSenderId: "481565089361",
    appId: "1:481565089361:web:90b79b9316af2871f56270"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
