import { useState } from 'react'
import './product.scss'

export function Product({ productData, createProduct, editProduct, deleteProduct }) {
  const [name, setName] = useState(productData?.name || '')
  const [url, setUrl] = useState(productData?.url || '')
  const [site, setSite] = useState(productData?.site || '')

  const localCreateProduct = async () => {
    try {
      await createProduct({ name, url, site })
      setName('')
      setUrl('')
      setSite('')
    } catch (e) {
      alert('No se ha podido crear el producto: \n' + e.message)
    }
  }

  return (
    <article className="productItem">
      <div className="fields">
        <div className="field">
          <label htmlFor={`${productData?.id}_name`} className="fieldLabel">Nombre</label>
          <input placeholder="Nombre del producto" id={`${productData?.id}_name`} type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={`${productData?.id}_site`} className="fieldLabel">Site</label>
          <input placeholder="Web del producto" id={`${productData?.id}_site`} type="text" value={site} onChange={e => setSite(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={`${productData?.id}_url`} className="fieldLabel">URL</label>
          <input placeholder="URL del producto" id={`${productData?.id}_url`} type="text" value={url} onChange={e => setUrl(e.target.value)} />
        </div>
      </div>
      <div className="actions">
        {createProduct ?
          <button className="blue" type="button" onClick={() => localCreateProduct()}>Crear</button> :
          <>
            <button className="blue" type="button" onClick={() => editProduct({ id: productData?.id, name, url, site })}>Guardar</button>
            <button className="red" type="button" onClick={() => deleteProduct(productData?.id)}>Eliminar</button>
          </>
        }
      </div>
    </article>
  )
}