import { Activity, Database, Map as MapIcon, Settings, Sprout, TreePine } from 'lucide-react'

export const navItems = [
  { id:'geospatial', label:'Geospatial Analysis', icon:MapIcon },
  { id:'recommend', label:'EcoRecommend', icon:Sprout },
  { id:'monitor', label:'Green Monitor', icon:Activity },
  { id:'twin', label:'Forest Digital Twin', icon:TreePine },
]

export default function Sidebar({ active, setActive }) {
  return (
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><TreePine size={21}/></div><div><b>REFOREST</b><strong>AI</strong></div></div>
      <nav>
        <span className="nav-label">COMMAND CENTER</span>
        {navItems.map(({id,label,icon:Icon}) => (
          <button key={id} className={active===id?'nav-item active':'nav-item'} onClick={()=>setActive(id)}>
            <Icon size={18}/><span>{label}</span>{id==='geospatial' && <i className="live-dot"/>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-item"><Database size={18}/><span>Data Repository</span></button>
        <button className="nav-item"><Settings size={18}/><span>Pengaturan</span></button>
        <div className="system"><div><i/><b>System Online</b></div><span>Last sync 2 min ago</span></div>
      </div>
    </aside>
  )
}
