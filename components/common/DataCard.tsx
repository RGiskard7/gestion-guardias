import React, { ReactNode } from "react"

interface DataCardProps {
  title: string
  icon?: string
  children: ReactNode
  actions?: ReactNode
  className?: string
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  icon,
  children,
  actions,
  className = ""
}) => {
  return (
    <div className={`card shadow-sm mb-4 ${className}`}>
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h5 className="mb-0 me-auto">
          {icon && <i className={`bi bi-${icon} me-2`}></i>}
          {title}
        </h5>
        {actions && (
          <div className="card-actions d-flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  )
}

export default DataCard 