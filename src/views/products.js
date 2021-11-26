import "./products.scss"
import { equalTo, get, onChildAdded, onChildRemoved, orderByChild, push, query, ref, remove, set } from '@firebase/database'
import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import { Product } from '../components/product/product';

const productsRef = ref(db, '/products')

export function Products() {

  const [batchProductsJson, setBatchProductsJson] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    onChildAdded(query(productsRef), productListSnap => {
      const newProduct = {
        id: productListSnap.key,
        ...productListSnap.val(),
      }
      setLoading(false)
      setProducts(existingProducts => [newProduct, ...existingProducts])
    })
    onChildRemoved(query(productsRef), productListSnap => {
      setProducts(existingProducts => [...existingProducts.filter(p => p.id !== productListSnap.key)])
    })
  }, [])

  const createProduct = async productData => {
    // Check if product with URL exists already
    const existingItem = await get(query(productsRef, orderByChild('url'), equalTo(productData.url)))
    if (existingItem.exists()) throw new Error(`Ya existe un producto con la URL "${productData.url}"`)
    push(productsRef, {
      name: productData.name,
      site: productData.site,
      url: productData.url,
    })
  }

  const createAllProducts = async () => {
    const products = JSON.parse(batchProductsJson)
    try {
      await Promise.all(products.map(p => createProduct(p)))
    } catch (e) {
      console.log('this failed: ', e.message)
    }
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

  return (
    <div className="productsPage">
      <h1 className="heading">Productos</h1>
      <h2 className="subheading">Scripts</h2>
      <h3 className="subsubheading">Pccomponentes</h3>
      <code>{`JSON.stringify([...document.querySelectorAll('.product-card')].map(pc => ({name: pc.parentNode.dataset.name, url: pc.parentNode.getAttribute('href'), site: 'pccomponentes' })))`}</code>
      <h3 className="subsubheading">Coolmod</h3>
      <code>{`JSON.stringify([...document.querySelectorAll('[data-role=result]')].map(pc => ({name: pc.querySelector('.df-card__title').innerText, url: pc.querySelector('.df-card__main').getAttribute('href'), site: 'coolmod' })))`}</code>
      <div className="productCreation">
        <div className="massCreation">
          <h2 className="subheading">Crear productos en masa</h2>
          <textarea rows="10" onChange={e => setBatchProductsJson(e.target.value)} value={batchProductsJson}></textarea>
          <button className="blue" type="button" onClick={() => createAllProducts()}>Crear todos</button>
        </div>
        <div className="individualCreation">
          <h2 className="subheading">Crear producto</h2>
          <Product createProduct={createProduct} />
        </div>
      </div>
      <h2 className="subheading">Productos actuales</h2>
      <div className="productList">
        {loading ? 'Recuperando datos...' : products.map(p => <Product productData={p} editProduct={editProduct} deleteProduct={deleteProduct} key={p.id} />)}
      </div>
    </div>
  )
}