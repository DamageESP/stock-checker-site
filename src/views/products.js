import { equalTo, get, onChildAdded, onChildRemoved, orderByChild, push, query, ref, remove, set } from '@firebase/database'
import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import { Product } from '../components/product/product';

const productsRef = ref(db, '/products')

export function Products() {

  const [batchProductsJson, setBatchProductsJson] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    onChildAdded(query(productsRef), productListSnap => {
      const newProduct = {
        id: productListSnap.key,
        ...productListSnap.val(),
      }
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
      <h2 className="subheading">Crear productos en masa</h2>
      <code>{`JSON.stringify([...document.querySelectorAll('.product-card')].map(pc => ({name: pc.parentNode.dataset.name, url: pc.parentNode.getAttribute('href'), site: 'pccomponentes' })))`}</code>
      <textarea onChange={e => setBatchProductsJson(e.target.value)} value={batchProductsJson}></textarea>
      <button className="blue" type="button" onClick={() => createAllProducts()}>Crear todos</button>
      <h2 className="subheading">Crear producto</h2>
      <Product createProduct={createProduct} />
      <h2 className="subheading">Productos actuales</h2>
      <div className="productList">
        {products.map(p => <Product productData={p} editProduct={editProduct} deleteProduct={deleteProduct} key={p.id} />)}
      </div>
    </div>
  )
}