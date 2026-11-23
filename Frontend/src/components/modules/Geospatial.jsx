import { useState } from 'react'
import { MapContainer, TileLayer, Polygon, Tooltip, ZoomControl } from 'react-leaflet'
import { Layers3, MoreHorizontal, Satellite } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { CENTER, zones, severity } from '../../data/zones'
import PageTitle from '../layout/PageTitle'

function Metric({ label, value, unit }) {
  return <div className="metric"><span>{label}</span><b>{value}</b><small>{unit}</small></div>
}

function Inspector({ zone }) {
  const sev = severity(zone.dnbr)
  return (
    <aside className="inspector">
      <div className="inspector-head"><div><span>ZONE INSPECTOR</span><h3>{zone.id}</h3></div><button><MoreHorizontal size={18}/></button></div>
      <div className="zone-name"><span className="zone-dot" style={{background:sev.color}}/><div><b>{zone.name}</b><small>{zone.priority}</small></div></div>
      <div className="metric-grid">
        <Metric label="Luas Area" value={`${zone.area}`} unit="Ha"/>
        <Metric label="NDVI Saat Ini" value={zone.ndvi.toFixed(2)} unit="index"/>
        <Metric label="dNBR" value={zone.dnbr.toFixed(2)} unit={sev.label}/>
        <Metric label="Gambut" value={zone.depth.toFixed(1)} unit="meter"/>
      </div>
      <div className="nbr-row"><div><span>NBR Pre-Fire</span><b>{zone.nbrPre.toFixed(2)}</b></div><div><span>NBR Post-Fire</span><b>{zone.nbrPost.toFixed(2)}</b></div></div>
      <div className="severity"><span>TINGKAT KEPARAHAN</span><div><i style={{background:sev.color}}/><b style={{color:sev.color}}>{sev.label}</b></div></div>
    </aside>
  )
}

export default function Geospatial({ selected, setSelected }) {
  const [layer,setLayer] = useState('dnbr')
  const [tileFallback,setTileFallback] = useState(false)
  const selectedZone = zones.find(z=>z.id===selected) || zones[0]
  const fillFor = (zone) => {
    if(layer==='priority') return zone.priority.includes('1')?'#ef4444':zone.priority.includes('2')?'#eab308':'#10b981'
    if(layer==='rgb') return zone.dnbr>.65?'#9a4a32':zone.dnbr>.43?'#b58a4a':zone.dnbr>.26?'#668c62':'#4d8b70'
    return severity(zone.dnbr).color
  }
  return (
    <div className="module">
      <PageTitle eyebrow="MONITORING & ANALYSIS" title="Geospatial Burn & Severity" badge="Satellite Feed Active"/>
      <div className="map-layout">
        <div className="map-card">
          <div className="map-toolbar">
            <span><Layers3 size={15}/> Visualization Layer</span>
            <div className="segmented">
              <button className={layer==='rgb'?'active':''} onClick={()=>setLayer('rgb')}><Satellite size={14}/> Citra</button>
              <button className={layer==='dnbr'?'active':''} onClick={()=>setLayer('dnbr')}>dNBR</button>
              <button className={layer==='priority'?'active':''} onClick={()=>setLayer('priority')}>Prioritas RF</button>
            </div>
          </div>
          <MapContainer center={CENTER} zoom={12} minZoom={10} zoomControl={false} className="leaflet-map">
            {!tileFallback ? (
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" eventHandlers={{tileerror:()=>setTileFallback(true)}}/>
            ) : (
              <TileLayer attribution='Tiles &copy; Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"/>
            )}
            <ZoomControl position="bottomright"/>
            {zones.map(zone=>(
              <Polygon key={zone.id} positions={zone.coords} pathOptions={{color:fillFor(zone),fillColor:fillFor(zone),fillOpacity:selected===zone.id?0.72:0.48,weight:selected===zone.id?3:1}} eventHandlers={{click:()=>setSelected(zone.id)}}>
                <Tooltip direction="top" offset={[0,-8]} opacity={1}><b>{zone.id}</b><br/>dNBR {zone.dnbr.toFixed(2)} · {severity(zone.dnbr).label}</Tooltip>
              </Polygon>
            ))}
          </MapContainer>
          {layer==='dnbr'&&<div className="legend"><b>Fire Severity (dNBR)</b><div><span>0.10</span><i/><span>0.27</span><i/><span>0.44</span><i/><span>0.66+</span></div></div>}
          {layer==='priority'&&<div className="legend priority-legend"><b>Random Forest Priority</b><div><i className="red"/>P1&nbsp;&nbsp;<i className="yellow"/>P2&nbsp;&nbsp;<i className="green"/>P3</div></div>}
          <div className="map-coordinates">LAT {CENTER[0].toFixed(4)} &nbsp; LNG {CENTER[1].toFixed(4)} &nbsp; | &nbsp; 2D / EPSG:4326</div>
        </div>
        <Inspector zone={selectedZone}/>
      </div>
      <div className="model-strip">
        <div className="model-score"><div className="radial"><b>89.4%</b></div><div><span>ACCURACY MODEL</span><b>Random Forest</b><small>Validation: 10-Fold CV</small></div></div>
        <div className="feature-bars">
          <span>FEATURE IMPORTANCE</span>
          {[['dNBR',92],['Kedalaman Gambut',76],['Jarak dari Kanal',61],['Tinggi Muka Air Tanah',54]].map(([n,v])=><div key={n}><label>{n}</label><div><i style={{width:`${v}%`}}/></div><b>{(v/100).toFixed(2)}</b></div>)}
        </div>
      </div>
    </div>
  )
}
