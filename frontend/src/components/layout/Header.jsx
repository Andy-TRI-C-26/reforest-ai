import { Bell, ChevronDown, Menu, Search } from 'lucide-react'
import { navItems } from './Sidebar'

export default function Header({ active }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" aria-label="Menu"><Menu size={19}/></button>
      <div className="breadcrumbs"><span>KHDTK Tumbang Nusa</span><span>/</span><b>{navItems.find(n=>n.id===active)?.label}</b></div>
      <div className="header-actions">
        <button className="icon-btn"><Search size={18}/></button>
        <button className="icon-btn notify"><Bell size={18}/><i/></button>
        <div className="profile"><div className="avatar">AR</div><div><b>Arif R.</b><span>Forest Analyst</span></div><ChevronDown size={14}/></div>
      </div>
    </header>
  )
}
