export default function PageTitle({ eyebrow, title, badge }) {
  return (
    <div className="page-title">
      <div><span>{eyebrow}</span><h1>{title}</h1></div>
      {badge && <div className="status-badge"><i /> {badge}</div>}
    </div>
  )
}
