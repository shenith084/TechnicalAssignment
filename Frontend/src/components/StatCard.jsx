import './StatCard.css'

export default function StatCard({ title, value, icon: Icon, color = 'accent', subtitle }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  )
}
