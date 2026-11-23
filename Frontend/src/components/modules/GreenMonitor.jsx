import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Activity, Droplets, Leaf } from 'lucide-react'
import { zones, trendData } from '../../data/zones'
import PageTitle from '../layout/PageTitle'

export default function GreenMonitor({ selected }) {
  const zone = zones.find(z=>z.id===selected)||zones[0]
  return (
    <div className="module">
      <PageTitle eyebrow="VEGETATION OBSERVATION" title="Green Monitor" badge="Live Monitoring"/>
      <div className="kpi-grid">
        <div className="kpi"><div className="kpi-icon red"><Activity size={19}/></div><span>Total Luas Terdampak</span><b>{zones.reduce((a,z)=>a+z.area,0).toLocaleString('id-ID')}<small> Ha</small></b><em>+12.4% sejak 2023</em></div>
        <div className="kpi"><div className="kpi-icon green"><Leaf size={19}/></div><span>Pemulihan Kanopi</span><b>{Math.round(zone.ndvi*100)}<small>%</small></b><em>+8.2% YoY</em></div>
        <div className="kpi"><div className="kpi-icon amber"><Droplets size={19}/></div><span>Indeks Kesehatan Gambut</span><b>72.8<small>/100</small></b><em>Stable</em></div>
      </div>
      <div className="chart-layout">
        <div className="card chart-card">
          <div className="card-head">
            <div><span>TREN VEGETASI · {zone.id}</span><h2>Indeks Pemulihan NDVI</h2></div>
            <div className="chart-legend"><i className="restored"/>Direstorasi<i className="control"/>Kontrol</div>
          </div>
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={trendData} margin={{top:15,right:10,left:-20,bottom:0}}>
              <defs><linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.35}/><stop offset="95%" stopColor="#34d399" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid stroke="#26332f" strokeDasharray="3 3"/>
              <XAxis dataKey="period" tick={{fill:'#7f918a',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis domain={[-0.4,0.8]} tick={{fill:'#7f918a',fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:'#17231f',border:'1px solid #30443c',borderRadius:'8px'}}/>
              <Area type="monotone" dataKey="restored" stroke="#34d399" strokeWidth={2} fill="url(#greenFill)" name="Direstorasi"/>
              <Area type="monotone" dataKey="unrestored" stroke="#71827a" strokeWidth={2} fill="transparent" strokeDasharray="5 5" name="Tidak Direstorasi"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card chart-card nbr-chart">
          <div className="card-head"><div><span>BURN RATIO</span><h2>NBR Kuartalan</h2></div></div>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={trendData} margin={{top:15,right:5,left:-25,bottom:0}}>
              <CartesianGrid stroke="#26332f" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="period" tick={{fill:'#7f918a',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis domain={[-0.5,0.6]} tick={{fill:'#7f918a',fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:'#17231f',border:'1px solid #30443c',borderRadius:'8px'}}/>
              <Bar dataKey="nbrRestored" fill="#34d399" radius={[3,3,0,0]} name="NBR Direstorasi"/>
              <Bar dataKey="nbrUnrestored" fill="#65756f" radius={[3,3,0,0]} name="NBR Kontrol"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
