import { useEffect, useState } from 'react'
import { apiGet } from '../api'

export default function useApi(path) {
  const [data,setData] = useState(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')

  useEffect(()=>{
    let active=true
    setLoading(true)
    setError('')
    apiGet(path).then(value=>{
      if(active) setData(value)
    }).catch(err=>{
      if(active) setError(err.message)
    }).finally(()=>{
      if(active) setLoading(false)
    })
    return ()=>{ active=false }
  },[path])

  return {data,loading,error}
}
