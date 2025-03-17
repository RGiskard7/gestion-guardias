import React from "react"
import Link from "next/link"

interface ActionCardProps {
  title: string
  description: string
  icon: string
  linkHref: string
  linkText: string
  color?: string
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  linkHref,
  linkText,
  color = "primary"
}) => {
  return (
    <div className="card dashboard-card h-100 shadow-sm">
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-center mb-3">
          <div className={`dashboard-icon bg-${color} bg-opacity-10 text-${color} me-3`}>
            <i className={`bi bi-${icon}`}></i>
          </div>
          <h5 className="card-title mb-0">{title}</h5>
        </div>
        <div className="w-100 mb-3">
          <p className="card-text">{description}</p>
        </div>
        <div className="mt-auto">
          <Link href={linkHref} className={`btn btn-${color}`}>
            {linkText} <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ActionCard 