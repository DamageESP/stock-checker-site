import './reset.scss';
import './App.scss';

import { ref, onChildAdded, onChildChanged, limitToLast, query, push, set, remove, onChildRemoved } from "firebase/database";
import { useEffect, useState } from 'react'
import { DataItem } from './components/data-item';
import { signInWithRedirect, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth'
import { Product } from './components/product/product';
import { auth, db } from './lib/firebase';


const dataRef = ref(db, '/data')
const stockRef = ref(db, '/latestStock')
const last50DataRef = query(dataRef, limitToLast(50))
const lastHourInStock = query(stockRef, limitToLast(50))

function App() {
  const [data, setData] = useState([])
  const [inStockItems, setInStockItems] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState()
  const [isAdmin, setIsAdmin] = useState(false)

  const addData = newItems => {
    setData(curData => [...curData, ...newItems])
  }

  const addInStock = newItems => {
    setInStockItems(curData => [...curData, ...newItems])
  }

  const replaceData = dataItem => {
    setData(curData => {
      const copy = [...curData]
      copy[copy.findIndex(cd => cd.id === dataItem.id)] = dataItem
      return copy
    })
  }

  const replaceInStock = dataItem => {
    setInStockItems(curData => {
      const copy = [...curData]
      copy[copy.findIndex(cd => cd.id === dataItem.id)] = dataItem
      return copy
    })
  }

  const startAuth = () => {
    const provider = new GoogleAuthProvider()
    signInWithRedirect(auth, provider)
  }

  const createProduct = productData => {
    push(ref(db, '/products'), {
      name: productData.name,
      site: productData.site,
      url: productData.url,
    })
  }

  const editProduct = productData => {
    set(ref(db, `/products/${productData.id}`), {
      name: productData.name,
      site: productData.site,
      url: productData.url,
    })
  }

  const deleteProduct = productId => {
    remove(ref(db, `/products/${productId}`))
  }

  useEffect(() => {
    onChildAdded(query(ref(db, '/products')), productListSnap => {
      const newProduct = {
        id: productListSnap.key,
        ...productListSnap.val(),
      }
      setProducts(existingProducts => [newProduct, ...existingProducts])
    })
    onChildRemoved(query(ref(db, '/products')), productListSnap => {
      setProducts(existingProducts => [...existingProducts.filter(p => p.id !== productListSnap.key)])
    })
    onChildRemoved(query(ref(db, '/latestStock')), productListSnap => {
      setInStockItems(existingProducts => [...existingProducts.filter(p => p.id !== productListSnap.key)])
    })
    setLoading(true)
    onChildAdded(last50DataRef, (snapshot) => {
      const data = {
        id: snapshot.key,
        ...snapshot.val(),
      }
      setLoading(false)
      addData([data])
    })
    onChildAdded(lastHourInStock, (snapshot) => {
      const data = {
        id: snapshot.key,
        ...snapshot.val(),
      }
      addInStock([data])
    })
    onChildChanged(lastHourInStock, (snapshot) => {
      const data = {
        id: snapshot.key,
        ...snapshot.val(),
      }
      replaceInStock(data)
    })
    onChildChanged(last50DataRef, (snapshot) => {
      const data = {
        id: snapshot.key,
        ...snapshot.val(),
      }
      replaceData(data)
    })
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
      {loggedIn === true ? <button onClick={() => signOut(auth)} type="button">logout</button> : loggedIn === false ? <button onClick={() => startAuth()} type="button">login</button> : 'Checking your session...'}
      {isAdmin &&
        <>
          <h1 className="heading">Productos</h1>
          <h2 className="subheading">Crear producto</h2>
          <div className="productList">
            <Product createProduct={createProduct} />
          </div>
          <h2 className="subheading">Productos actuales</h2>
          <div className="productList">
            {products.map(p => <Product productData={p} editProduct={editProduct} deleteProduct={deleteProduct} key={p.id} />)}
          </div>
        </>
      }
      <h1 className="heading">En stock</h1>
      <div className="data">
        {inStockItems.map(d => ({ ...d, isInStock: true })).map(d => (
          <DataItem dataItem={d} key={d.id} />
        ))}
      </div>
      <h1 className="heading">Información en directo</h1>
      <div className="data">
        {loading ? 'Recuperando datos...' : data.sort((a, b) => a.date > b.date ? -1 : 1).map(d => (
          <DataItem dataItem={d} key={d.id} />
        ))}
      </div>
    </div>
  );
}

export default App;
