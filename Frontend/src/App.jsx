import { useEffect, useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Geospatial from './components/modules/Geospatial'
import EcoRecommend from './components/modules/EcoRecommend'
import GreenMonitor from './components/modules/GreenMonitor'
import ForestTwin from './components/modules/ForestTwin'
import './App.css'
import { apiGet } from './api'

function priorityLabel(priority) {
  if(priority==='PRIORITY_1') return 'Prioritas 1 - Kritis'
  if(priority==='PRIORITY_2') return 'Prioritas 2 - Sedang'
  return 'Prioritas 3 - Alami'
}

export default function App() {
  const [active,setActive]=useState('geospatial')
  const [selected,setSelected]=useState('ZONA-TN-01')
  const [zones,setZones]=useState([])
  const [center,setCenter]=useState([-2.3456,114.0890])
  const [loadError,setLoadError]=useState('')

  useEffect(()=>{
    apiGet('/zones').then(data=>{
      const normalized=data.features.map(feature=>{
        const p=feature.properties
        const ring=feature.geometry.coordinates[0].map(([lng,lat])=>[lat,lng])
        return {
          id:p.id,name:p.name,area:p.area_ha,nbrPre:p.nbr_pre,nbrPost:p.nbr_post,
          dnbr:p.dnbr,ndvi:p.ndvi,depth:p.peat_depth_m,distance:p.canal_distance_m,
          watertable:p.water_table_cm,priority:p.priority_label,coords:ring,
          severity:p.severity_label,severityColor:p.severity_color,
        }
      })
      setZones(normalized)
      if(normalized[0]) setSelected(normalized[0].id)
    }).catch(error=>setLoadError(error.message))
  },[])

  if(loadError) return <div className="loading-state">Gagal memuat backend: {loadError}</div>
  if(!zones.length) return <div className="loading-state">Memuat data geospasial dari backend...</div>

  return (
    <div className="app-shell">
      <Sidebar active={active} setActive={setActive}/>
      <div className="main-shell">
        <Header active={active}/>
        <main>
          {active==='geospatial'&&<Geospatial selected={selected} setSelected={setSelected} zones={zones} center={center}/>}
          {active==='recommend'&&<EcoRecommend selected={selected} zones={zones}/>}
          {active==='monitor'&&<GreenMonitor selected={selected} zones={zones}/>}
          {active==='twin'&&<ForestTwin selected={selected} zones={zones}/>}
        </main>
      </div>
    </div>
  )
}
