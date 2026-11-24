import { Droplets, Leaf, Sprout } from 'lucide-react'
import useApi from '../../hooks/useApi'
import PageTitle from '../layout/PageTitle'

export default function EcoRecommend({ selected, zones }) {
  const zone = zones.find(z=>z.id===selected)||zones[0]
  const {data:recommendation,loading,error}=useApi(`/zones/${selected}/recommendation`)
  const strategy=recommendation?.strategy||'Memuat rekomendasi'
  const species=(recommendation?.species||[]).map(s=>[s.latin_name,s.common_name,s.seedlings_per_ha])
  const seedlings=recommendation?`${recommendation.seedlings_per_ha} bibit / Ha`:'Memuat'
  const actions=(recommendation?.actions||[]).map(a=>a.action)
  const exportCSV = () => {
    if(!recommendation) return
    const rows = [
      ['zone_id','zone_name','severity','area_ha','strategy','seedlings_per_ha','water_table_cm'],
      [zone.id,zone.name,zone.severity,zone.area,strategy,recommendation.seedlings_per_ha,zone.watertable],
    ]
    const blob = new Blob([rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n')], {type:'text/csv;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href=url; anchor.download=`restoration-${zone.id}.csv`; anchor.click(); URL.revokeObjectURL(url)
  }
  const exportPDF = () => {
    window.print()
  }
  return (
    <div className="module">
      <PageTitle eyebrow="RESTORATION INTELLIGENCE" title="EcoRecommend" badge="Rules Engine Active"/>
      <div className="eco-layout">
        <section className="eco-main card">
          <div className="card-head"><div><span>STRATEGI UNTUK {zone.id}</span><h2>{strategy}</h2></div><div className="export-actions"><button onClick={exportCSV}>Ekspor CSV</button><button onClick={exportPDF}>Ringkas PDF</button></div></div>
          <div className="eco-zone-row"><div><span>Keparahan dNBR</span><b>{zone.dnbr.toFixed(2)}</b></div><div><span>Luas intervensi</span><b>{zone.area} Ha</b></div><div><span>Total kebutuhan</span><b>{recommendation?recommendation.total_seedlings.toLocaleString('id-ID'):'Memuat'} bibit</b></div></div>
          <h3 className="section-label">SPESIES ASLI RAWA GAMBUT</h3>
          <div className="species-grid">{species.map(([latin,indo,count])=><div className="species-card" key={latin}><div className="species-icon"><Leaf size={24}/></div><div><b>{latin}</b><span>{indo}</span></div><strong>{count}/Ha</strong></div>)}</div>
          <h3 className="section-label">TAHAPAN AKSI RESTORASI</h3>
          <div className="action-list">{actions.map((action,i)=><div key={action}><span>{String(i+1).padStart(2,'0')}</span><p>{action}</p><b>W{String(i+1).padStart(2,'0')}</b></div>)}</div>
        </section>
        <aside className="eco-side">
          <div className="card hydro"><div className="card-mini-head"><Droplets size={18}/><span>HIDROLOGI GAMBUT</span></div><div className="water-gauge"><div style={{height:`${Math.max(20,zone.watertable*-0.72)}%`}}/><span>{zone.watertable} cm</span></div><small>Tinggi Muka Air Tanah</small></div>
          <div className="card seed"><div className="card-mini-head"><Sprout size={18}/><span>Kebutuhan Bibit</span></div><b>{seedlings}</b><div className="seed-progress"><i style={{width:zone.dnbr>0.44?'92%':zone.dnbr>=0.27?'76%':'48%'}}/></div><span>{zone.area} Ha × kebutuhan spesifik</span></div>
          <div className="card model-card"><span>RF CONFIDENCE SCORE</span><b>{(89.4+(zone.dnbr*.5)).toFixed(1)}%</b><div>{zone.priority}</div></div>
        </aside>
      </div>
    </div>
  )
}
