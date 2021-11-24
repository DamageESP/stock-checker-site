import './reset.scss';
import './App.scss';

import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from 'react'
import { signInWithRedirect, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase';
import { Products } from './views/products';
import { Home } from './views/home';


function App() {

  const [loggedIn, setLoggedIn] = useState()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        if (user.uid === "7Xhp5BspVFNqxngdLYKk5C9Hzm62") setIsAdmin(true)
        setLoggedIn(true)
      } else {
        setIsAdmin(false)
        setLoggedIn(false)
      }
    })
  }, [])

  return (
    <div className="app">
      {loggedIn === true ? <button className="red" onClick={() => signOut(auth)} type="button">logout</button> : loggedIn === false ? <button className="blue" onClick={() => signInWithRedirect(auth, new GoogleAuthProvider())} type="button">login</button> : 'Checking your session...'}
      {isAdmin &&
        <nav>
          <Link to="/stock-checker-site">Home</Link>
          <Link to="/stock-checker-site/products">Products</Link>
        </nav>
      }
      <Routes>
        <Route path="/stock-checker-site" element={<Home />} />
        {isAdmin && <Route path="/stock-checker-site/products" element={<Products />} />}
      </Routes>
    </div>
  );
}

export default App;
