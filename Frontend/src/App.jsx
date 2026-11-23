import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Geospatial from './components/modules/Geospatial'
import EcoRecommend from './components/modules/EcoRecommend'
import GreenMonitor from './components/modules/GreenMonitor'
import ForestTwin from './components/modules/ForestTwin'
import './App.css'

export default function App() {
  const [active,setActive]=useState('geospatial')
  const [selected,setSelected]=useState('ZONA-TN-01')

  return (
    <div className="app-shell">
      <Sidebar active={active} setActive={setActive}/>
      <div className="main-shell">
        <Header active={active}/>
        <main>
          {active==='geospatial'&&<Geospatial selected={selected} setSelected={setSelected}/>}
          {active==='recommend'&&<EcoRecommend selected={selected}/>}
          {active==='monitor'&&<GreenMonitor selected={selected}/>}
          {active==='twin'&&<ForestTwin selected={selected}/>}
        </main>
      </div>
    </div>
  )
}
