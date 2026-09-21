const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyBnubQM46SsuZUz2TncL4uyVhi0tVhH0gU",
    authDomain: "tabuada-4b7d9.firebaseapp.com",
    projectId: "tabuada-4b7d9",
    storageBucket: "tabuada-4b7d9.firebasestorage.app",
    messagingSenderId: "185531304834",
    appId: "1:185531304834:web:a2b92e32991f34c49b5d9b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
    try {
        await setDoc(doc(db, "users", "test_bot"), {
            username: "test_bot",
            test: true
        });
        console.log("SUCCESS!");
    } catch (e) {
        console.error("ERROR:", e);
    }
}
test();
