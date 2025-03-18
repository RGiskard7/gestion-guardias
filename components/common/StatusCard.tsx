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
  const cardClasses = `card text-white bg-${color} mb-3 shadow-sm ${onClick ? 'cursor-pointer' : ''}`
  
  return (
    <div 
      className={cardClasses} 
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title">{title}</h5>
            <p className="display-4">{value}</p>
            {subtitle && <p className="card-text">{subtitle}</p>}
          </div>
          <div className="dashboard-icon">
            <i className={`bi bi-${icon} fs-1`}></i>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusCard 