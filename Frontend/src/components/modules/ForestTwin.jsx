import { useState } from 'react'
import { CircleGauge, Droplets, ShieldCheck, Wind, X } from 'lucide-react'
import { zones } from '../../data/zones'
import PageTitle from '../layout/PageTitle'
import GambutScene from '../twin/GambutScene'

export default function ForestTwin({ selected }) {
  const [year,setYear]=useState(0)
  const zone=zones.find(z=>z.id===selected)||zones[0]
  const carbon=year===0?0:year*1.34
  const water=zone.watertable+year*5.2
  const canopy=Math.min(92,year*8.4)
  return (
    <div className="module">
      <PageTitle eyebrow="3D SCENARIO MODEL" title="Forest Digital Twin" badge={`Selected: ${zone.id}`}/>
      <div className="twin-layout">
        <div className="twin-viewport">
          <div className="viewport-toolbar"><span><span className="live-dot"/> 3D RESTORATION VIEW</span><div><button>2D</button><button className="active">3D</button><button><X size={13}/></button></div></div>
          <div className="isometric-scene"><GambutScene zone={zone} year={year}/></div>
          <div className="timeline">
            <div className="timeline-head"><span>Timeline Restorasi: Tahun ke-0 s/d ke-10</span><b>Tahun ke-{year}</b></div>
            <input type="range" min="0" max="10" value={year} onChange={e=>setYear(Number(e.target.value))}/>
            <div className="timeline-labels"><span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span></div>
          </div>
        </div>
        <aside className="twin-side">
          <div className="card twin-stats"><span>INDIKATOR PROYEKTIF</span><div><CircleGauge size={18}/><p>Tutupan Kanopi</p><b>{canopy.toFixed(0)}%</b></div><div><Wind size={18}/><p>Serapan CO₂</p><b>{carbon.toFixed(1)}<small> t/Ha</small></b></div><div><Droplets size={18}/><p>Muka Air Tanah</p><b>{water.toFixed(1)}<small> cm</small></b></div></div>
          <div className="card twin-zone"><span>ZONA MODEL</span><h3>{zone.id}</h3><p>{zone.name}</p><div><b>{zone.area} Ha</b><small>Model area</small></div></div>
          <div className="card scenario-note"><ShieldCheck size={18}/><div><b>Skenario konservatif</b><p>Asumsi pemeliharaan sekat kanal dan survival tanaman stabil.</p></div></div>
        </aside>
      </div>
    </div>
  )
}
