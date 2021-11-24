import { onChildAdded, onChildRemoved, query, ref, limitToLast, onChildChanged } from '@firebase/database'
import { useEffect, useState } from 'react'
import { DataItem } from '../components/data-item/data-item'
import { db } from '../lib/firebase'

const dataRef = ref(db, '/data')
const stockRef = ref(db, '/latestStock')
const last50DataRef = query(dataRef, limitToLast(50))
const lastHourInStock = query(stockRef, limitToLast(50))

export function Home() {

  const [data, setData] = useState([])
  const [inStockItems, setInStockItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
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
  }, [])

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

  return (
    <div className="homePage">
      <h1 className="heading">En stock</h1>
      <div className="data">
        {inStockItems.sort((a, b) => parseFloat(a.productPrice) > parseFloat(b.productPrice) ? 1 : -1).map(d => ({ ...d, isInStock: true })).map(d => (
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
  )
}