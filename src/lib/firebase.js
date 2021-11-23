import { initializeApp } from "@firebase/app"
import { getAuth } from "@firebase/auth"
import { getDatabase } from "@firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyD4XxIuiekhE84uh7_IIVX8Fzf3wXYCcDA",
  authDomain: "price-tracker-1c428.firebaseapp.com",
  databaseURL: "https://price-tracker-1c428.firebaseio.com",
  projectId: "price-tracker-1c428",
  storageBucket: "price-tracker-1c428.appspot.com",
  messagingSenderId: "371469893400",
  appId: "1:371469893400:web:661c8956a419487ddc286d",
  measurementId: "G-GJBMLVW97M"
};

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)