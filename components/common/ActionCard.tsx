import React from "react"
import Link from "next/link"

interface ActionCardProps {
  title: string
  description: string
  icon: string
  linkHref: string
  linkText: string
  color?: "primary" | "success" | "info" | "warning" | "danger" | "secondary"
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  linkHref,
  linkText,
  color = "primary"
}) => {
  // Colores de fondo para los iconos según el modo oscuro/claro
  const getIconBgClass = () => {
    const baseAlpha = "rgba(37, 99, 235, 0.1)"; // Color base para primary
    
    // Mapeo de colores a valores rgba
    const colorMap: Record<string, string> = {
      primary: "rgba(37, 99, 235, 0.1)",
      success: "rgba(22, 163, 74, 0.1)",
      info: "rgba(2, 132, 199, 0.1)",
      warning: "rgba(202, 138, 4, 0.1)",
      danger: "rgba(220, 38, 38, 0.1)",
      secondary: "rgba(71, 85, 105, 0.1)"
    };
    
    return colorMap[color] || baseAlpha;
  };

  return (
    <div className="dashboard-card">
      <div className="card-body">
        <div className="dashboard-icon" style={{ backgroundColor: getIconBgClass() }}>
          <i className={`bi bi-${icon}`}></i>
        </div>
        <h3 className="card-title">{title}</h3>
        <p className="card-text">{description}</p>
        <Link href={linkHref} className={`btn btn-${color}`}>
          {linkText}
          <i className="bi bi-arrow-right ms-2"></i>
        </Link>
      </div>
    </div>
  )
}

export default ActionCard 