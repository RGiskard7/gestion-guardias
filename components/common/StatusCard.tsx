import React from "react"

interface StatusCardProps {
  title: string
  value: string | number
  icon: string
  color: "primary" | "success" | "info" | "warning" | "danger" | "secondary"
  subtitle?: string
  onClick?: () => void
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  onClick
}) => {
  return (
    <div 
      className={`stats-card ${color}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : undefined,
        height: '100%',
        minHeight: '160px'
      }}
    >
      <div className="card-body">
        <div className="icon-background"></div>
        <h5 className="card-title">{title}</h5>
        <p className="value">{value}</p>
        {subtitle && <p className="subtitle">{subtitle}</p>}
        <div className="position-absolute top-0 end-0 p-3">
          <i className={`bi bi-${icon}`} style={{ fontSize: '1.5rem' }}></i>
        </div>
      </div>
    </div>
  )
}

export default StatusCard 