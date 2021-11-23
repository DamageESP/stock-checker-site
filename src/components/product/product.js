import { useState } from 'react'
import './product.scss'

export function Product({ productData, createProduct, editProduct, deleteProduct }) {
  const [id, setId] = useState(productData?.id)
  const [name, setName] = useState(productData?.name)
  const [url, setUrl] = useState(productData?.url)
  const [site, setSite] = useState(productData?.site)

  const localCreateProduct = () => {
    createProduct({ name, url, site })
    setName('')
    setUrl('')
    setSite('')
  }

  return (
    <article className="productItem">
      <ul>
        <li><label>Nombre</label><input type="text" value={name} onChange={e => setName(e.target.value)} /></li>
        <li><label>Web</label><input type="text" value={site} onChange={e => setSite(e.target.value)} /></li>
        <li><label>URL</label><input type="text" value={url} onChange={e => setUrl(e.target.value)} /></li>
      </ul>
      {createProduct ? <button type="button" onClick={() => localCreateProduct()}>Crear</button> : <>
        <button type="button" onClick={() => editProduct({ id, name, url, site })}>Guardar</button>
        <button type="button" onClick={() => deleteProduct(id)}>Eliminar</button>
      </>}
    </article>
  )
}