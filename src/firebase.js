import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"
const firebaseConfig = {
  apiKey: "AIzaSyANZfTEwP4mSsVcZ7ZOWCXhvrFR8hFPfV0",
  authDomain: "locate-a-doctor-d02ae.firebaseapp.com",
  projectId: "locate-a-doctor-d02ae",
  storageBucket: "locate-a-doctor-d02ae.appspot.com",
  messagingSenderId: "464437985962",
  appId: "1:464437985962:web:3b4552afd92163159246d3",
  measurementId: "G-BNNS1GGRF4"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default getFirestore();

