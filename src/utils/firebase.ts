import { initializeApp } from 'firebase/app';
import { getAuth, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyClEikMbke_V5OFbdniHLioP3phOS3Ywmw",
    authDomain: "finetechcmtodo.firebaseapp.com",
    projectId: "finetechcmtodo",
    storageBucket: "finetechcmtodo.firebasestorage.app",
    messagingSenderId: "109017679994",
    appId: "1:109017679994:web:465b284cc1036de7af13c3",
    measurementId: "G-MLRKB7XM56"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const githubProvider = new GithubAuthProvider();

// Configure GitHub provider
githubProvider.setCustomParameters({
    prompt: 'select_account'
});

export {
    app,
    auth,
    db,
    storage,
    analytics,
    githubProvider
};