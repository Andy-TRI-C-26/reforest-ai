import { Droplets, Leaf, Sprout } from 'lucide-react'
import { zones, severity } from '../../data/zones'
import PageTitle from '../layout/PageTitle'

export default function EcoRecommend({ selected }) {
  const zone = zones.find(z=>z.id===selected)||zones[0]
  const sev = severity(zone.dnbr)
  let strategy, species, seedlings, actions
  if(zone.dnbr>0.44) {
    strategy='Intervensi Hidrologi & Stabilitas Lahan'
    species=[['Melaleuca cajuputi','Gelam',650],['Shorea balangeran','Belangeran',250]]
    seedlings='900 bibit / Ha'
    actions=['Bentuk posko dan blokir aliran kanal segera','Pasang sekat kanal (canal blocking) berlapis','Bantu pemulihan tanah gambut hangus','Tanam Melaleuca cajuputi pada konsentrasi tinggi','Monitor tinggi muka air 2 kali seminggu']
  } else if(zone.dnbr>=0.27) {
    strategy='Pengayaan Tanaman dan Pemulihan Kanopi'
    species=[['Shorea balangeran','Belangeran',400],['Dyera polyphylla','Jelutung Rawa',350]]
    seedlings='750 bibit / Ha'
    actions=['Bersihkan kompetitor invasif secara selektif','Lakukan enrichment planting pada rumpang tajuk','Tanam Shorea balangeran dan Dyera polyphylla','Pertahankan blokade kanal secara berkala','Evaluasi survival planting pada bulan ke-3']
  } else {
    strategy='Suksesi Alamiah Terbantu'
    species=[['Melaleuca cajuputi','Gelam',300],['Shorea balangeran','Belangeran',200]]
    seedlings='500 bibit / Ha'
    actions=['Pasang rintisan patroli pencegahan api','Hindari pembukaan vegetasi alami','Bantu regenerasi pionir di rumpang kecil','Pertahankan lembab dan blok kanal ringan','Pantau penyebaran vegetasi per kuartal']
  }
  return (
    <div className="module">
      <PageTitle eyebrow="RESTORATION INTELLIGENCE" title="EcoRecommend" badge="Rules Engine Active"/>
      <div className="eco-layout">
        <section className="eco-main card">
          <div className="card-head"><div><span>STRATEGI UNTUK {zone.id}</span><h2>{strategy}</h2></div><div className="severity-pill" style={{borderColor:sev.color,color:sev.color}}>{sev.label}</div></div>
          <div className="eco-zone-row"><div><span>Keparahan dNBR</span><b>{zone.dnbr.toFixed(2)}</b></div><div><span>Luas intervensi</span><b>{zone.area} Ha</b></div><div><span>Total kebutuhan</span><b>{Math.round(zone.area*(zone.dnbr>0.44?900:zone.dnbr>=0.27?750:500)).toLocaleString('id-ID')} bibit</b></div></div>
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
