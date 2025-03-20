"use client"

import { useState, useEffect } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useAusencias } from "@/src/contexts/AusenciasContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { Guardia, Usuario, Lugar, Ausencia } from "@/src/types"
import { DB_CONFIG, getDuracionTramo } from "@/lib/db-config"

import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"

// Extender el tipo jsPDF para incluir autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => any;
    previousAutoTable: {
      finalY: number;
    };
  }
}

// Definir interfaz para el parámetro data de willDrawCell
interface AutoTableData {
  row: {
    section: string;
  };
  cursor: {
    y: number;
  };
}

export default function EstadisticasPage() {
  // ------------------------------
  // CONTEXTS Y ESTADOS
  // ------------------------------
  const { guardias } = useGuardias()
  const { ausencias } = useAusencias()
  const { lugares } = useLugares()
  const { usuarios } = useUsuarios()

  const [periodoInicio, setPeriodoInicio] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0]
  )
  const [periodoFin, setPeriodoFin] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [ausenciasEnPeriodo, setAusenciasEnPeriodo] = useState<Ausencia[]>([])

  // ------------------------------
  // HANDLERS DE PERIODO
  // ------------------------------
  const handlePeriodoInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPeriodoInicio(e.target.value)
  }
  const handlePeriodoFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPeriodoFin(e.target.value)
  }

  // ------------------------------
  // FILTRADO POR PERIODO
  // ------------------------------
  const guardiasEnPeriodo = guardias.filter((g) => {
    const fechaGuardia = new Date(g.fecha)
    return (
      fechaGuardia >= new Date(periodoInicio) &&
      fechaGuardia <= new Date(periodoFin)
    )
  })

  useEffect(() => {
    const inicio = new Date(periodoInicio)
    const fin = new Date(periodoFin)
    // Incluir todo el día final:
    fin.setHours(23, 59, 59, 999)

    const filtradas = ausencias.filter((a) => {
      if (!a.fecha) return false
      const fechaAusencia = new Date(a.fecha)
      return fechaAusencia >= inicio && fechaAusencia <= fin
    })
    setAusenciasEnPeriodo(filtradas)
  }, [ausencias, periodoInicio, periodoFin])

  // ------------------------------
  // DATOS BÁSICOS Y TRAMOS
  // ------------------------------
  const tramosHorarios = DB_CONFIG.TRAMOS_HORARIOS
  const diasUnicos = [
    ...new Set(guardiasEnPeriodo.map((g) => g.fecha)),
  ].sort()

  // ------------------------------
  // CONTADORES DE GUARDIAS
  // ------------------------------
  const pendientes = guardiasEnPeriodo.filter(
    (g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE
  ).length
  const asignadas = guardiasEnPeriodo.filter(
    (g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA
  ).length
  const firmadas = guardiasEnPeriodo.filter(
    (g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA
  ).length
  const anuladas = guardiasEnPeriodo.filter(
    (g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.ANULADA
  ).length
  const total = guardiasEnPeriodo.length

  // ------------------------------
  // CONTADORES DE AUSENCIAS
  // ------------------------------
  const ausenciasPendientes = ausenciasEnPeriodo.filter(
    (a) => a.estado === DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE
  ).length
  const ausenciasAceptadas = ausenciasEnPeriodo.filter(
    (a) => a.estado === DB_CONFIG.ESTADOS_AUSENCIA.ACEPTADA
  ).length
  const ausenciasRechazadas = ausenciasEnPeriodo.filter(
    (a) => a.estado === DB_CONFIG.ESTADOS_AUSENCIA.RECHAZADA
  ).length
  const totalAusencias = ausenciasEnPeriodo.length

  // ------------------------------
  // GUARDIAS POR TRAMO
  // ------------------------------
  const guardiasPorTramo = tramosHorarios.map((tramo) => {
    const lista = guardiasEnPeriodo.filter((g) => g.tramoHorario === tramo)
    return {
      tramo,
      total: lista.length,
      horas: lista.reduce((acc, g) => acc + getDuracionTramo(g.tramoHorario), 0),
    }
  })

  // ------------------------------
  // GUARDIAS POR DÍA Y TRAMO
  // ------------------------------
  const guardiasPorDiayTramo = diasUnicos.map((fecha) => {
    const guardiasDelDia = guardiasEnPeriodo.filter((g) => g.fecha === fecha)
    const porTramo = tramosHorarios.map((tramo) => {
      const guardiasTramo = guardiasDelDia.filter((g) => g.tramoHorario === tramo)
      const asigOrFirm = guardiasTramo.filter(
        (g) =>
          g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA ||
          g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA
      ).length
      const pendientes = guardiasTramo.filter(
        (g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE
      ).length

      return {
        tramo,
        total: guardiasTramo.length,
        asignadas: asigOrFirm,
        noAsignadas: pendientes,
        porcentajeAsignadas:
          guardiasTramo.length > 0
            ? Math.round((asigOrFirm / guardiasTramo.length) * 100)
            : 0,
      }
    })
    return { fecha, porTramo }
  })

  // ------------------------------
  // GUARDIAS POR PROFESOR
  // ------------------------------
  const profesoresIds = [
    ...new Set(guardiasEnPeriodo.map((g) => g.profesorCubridorId)),
  ].filter(Boolean) // quitar null/undefined

  const guardiasPorProfesor = profesoresIds.map((id) => {
    const profesor = usuarios.find((u) => u.id === id)
    const guardiasProfesor = guardiasEnPeriodo.filter((g) => g.profesorCubridorId === id)
    const firmadasProfesor = guardiasProfesor.filter(
      (g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA
    )

    const porTramo = tramosHorarios.map((tramo) => {
      const enTramo = guardiasProfesor.filter((g) => g.tramoHorario === tramo)
      return {
        tramo,
        total: enTramo.length,
        horas: enTramo.reduce((acc, g) => acc + getDuracionTramo(g.tramoHorario), 0),
      }
    })

    // GUARDIAS POR LUGAR
    const lugaresIds = [...new Set(guardiasProfesor.map((g) => g.lugarId))]
    const porLugar = lugaresIds.map((lugarId) => {
      const lugar = lugares.find((l) => l.id === lugarId)
      const guardiasEnLugar = guardiasProfesor.filter((g) => g.lugarId === lugarId)

      const porTramoLugar = tramosHorarios.map((tramo) => {
        const guardiasTramo = guardiasEnLugar.filter((g) => g.tramoHorario === tramo)
        return {
          tramo,
          total: guardiasTramo.length,
          horas: guardiasTramo.reduce((acc, guardia) => acc + getDuracionTramo(guardia.tramoHorario), 0),
        }
      })

      return {
        lugarId,
        lugarCodigo: lugar ? lugar.codigo : "Sin asignar",
        lugarDescripcion: lugar ? lugar.descripcion : "Sin asignar",
        total: guardiasEnLugar.length,
        horas: guardiasEnLugar.reduce((acc, guardia) => acc + getDuracionTramo(guardia.tramoHorario), 0),
        porTramo: porTramoLugar,
      }
    })

    return {
      profesorId: Number(id),
      profesorNombre: profesor
        ? `${profesor.nombre} ${profesor.apellido || ""}`
        : "Desconocido",
      total: guardiasProfesor.length,
      firmadas: firmadasProfesor.length,
      horasTotales: guardiasProfesor.reduce(
        (acc, g) => acc + getDuracionTramo(g.tramoHorario),
        0
      ),
      horasFirmadas: firmadasProfesor.reduce(
        (acc, g) => acc + getDuracionTramo(g.tramoHorario),
        0
      ),
      porTramo,
      porLugar,
    }
  })
  // Ordenar descendente por total guardias
  guardiasPorProfesor.sort((a, b) => b.total - a.total)

  // ------------------------------
  // GUARDIAS POR LUGAR
  // ------------------------------
  const lugaresIdsGuardias = [
    ...new Set(guardiasEnPeriodo.map((g) => g.lugarId)),
  ].filter(Boolean)

  const guardiasPorLugarData = lugaresIdsGuardias.map((id) => {
    const lugar = lugares.find((l) => l.id === id)
    const guardiasLugar = guardiasEnPeriodo.filter((g) => g.lugarId === id)
    return {
      lugarId: Number(id),
      lugarCodigo: lugar ? lugar.codigo : "Sin asignar",
      lugarDescripcion: lugar ? lugar.descripcion : "Sin asignar",
      total: guardiasLugar.length,
    }
  })
  guardiasPorLugarData.sort((a, b) => b.total - a.total)

  // ------------------------------
  // GUARDIAS POR TIPO
  // ------------------------------
  const tiposGuardia = [
    ...new Set(guardiasEnPeriodo.map((g) => g.tipoGuardia)),
  ].filter(Boolean)

  const guardiasPorTipoData = tiposGuardia.map((tipo) => {
    const grupo = guardiasEnPeriodo.filter((g) => g.tipoGuardia === tipo)
    return { tipo, total: grupo.length }
  })
  guardiasPorTipoData.sort((a, b) => b.total - a.total)

  // ------------------------------
  // AUSENCIAS POR PROFESOR
  // ------------------------------
  const ausenciasPorProfesorData = usuarios
    .filter((u) => u.rol === DB_CONFIG.ROLES.PROFESOR)
    .map((u) => {
      const ausenciasAceptadasProf = ausenciasEnPeriodo.filter(
        (a) => a.profesorId === u.id && a.estado === DB_CONFIG.ESTADOS_AUSENCIA.ACEPTADA
      )
      return {
        profesorId: u.id,
        profesorNombre: `${u.nombre} ${u.apellido || ""}`,
        total: ausenciasAceptadasProf.length,
      }
    })
    .filter((p) => p.total > 0)
    .sort((a, b) => b.total - a.total)

  // ------------------------------
  // FORMATEAR FECHAS
  // ------------------------------
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  // ------------------------------
  // EXPORTAR A PDF
  // ------------------------------
  const exportToPDF = () => {
    try {
      // Crear documento PDF en orientación horizontal
      const doc = new jsPDF("landscape");
      let currentPage = 1;
      
      // Función para agregar encabezado en cada página
      const addHeader = () => {
        // Título
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0); // Color negro
        doc.text("Sistema de Gestión de Guardias - Estadísticas", 14, 15);
        
        // Subtítulo con periodo
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100); // Color gris
        doc.text(
          `Periodo: ${new Date(periodoInicio).toLocaleDateString()} - ${new Date(periodoFin).toLocaleDateString()}`,
          14, 22
        );
        
        // Número de página
        doc.setFontSize(10);
        doc.text(`Página ${currentPage}`, 270, 10, { align: "right" });
        currentPage++;
        
        return 30; // Posición Y para comenzar a dibujar contenido
      };
      
      // Comenzar con primera página
      let yPos = addHeader();
      
      // SECCIÓN 1: Resumen de Guardias
      const guardiasData = [
        ["Estado", "Cantidad", "Porcentaje"],
        ["Pendientes", pendientes.toString(), total > 0 ? `${Math.round((pendientes / total) * 100)}%` : "0%"],
        ["Asignadas", asignadas.toString(), total > 0 ? `${Math.round((asignadas / total) * 100)}%` : "0%"],
        ["Firmadas", firmadas.toString(), total > 0 ? `${Math.round((firmadas / total) * 100)}%` : "0%"],
        ["Anuladas", anuladas.toString(), total > 0 ? `${Math.round((anuladas / total) * 100)}%` : "0%"],
        ["Total", total.toString(), "100%"]
      ];
      
      // Dibujar tabla de guardias
      doc.autoTable({
        head: [guardiasData[0]],
        body: guardiasData.slice(1),
        startY: yPos,
        margin: { left: 14 },
        theme: "grid",
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
        styles: { fontSize: 10 }
      });
      
      // SECCIÓN 2: Resumen de Ausencias
      yPos = doc.previousAutoTable.finalY + 10;
      
      const ausenciasData = [
        ["Estado", "Cantidad", "Porcentaje"],
        ["Pendientes", ausenciasPendientes.toString(), totalAusencias > 0 ? `${Math.round((ausenciasPendientes / totalAusencias) * 100)}%` : "0%"],
        ["Aceptadas", ausenciasAceptadas.toString(), totalAusencias > 0 ? `${Math.round((ausenciasAceptadas / totalAusencias) * 100)}%` : "0%"],
        ["Rechazadas", ausenciasRechazadas.toString(), totalAusencias > 0 ? `${Math.round((ausenciasRechazadas / totalAusencias) * 100)}%` : "0%"],
        ["Total", totalAusencias.toString(), "100%"]
      ];
      
      // Dibujar tabla de ausencias
      doc.autoTable({
        head: [ausenciasData[0]],
        body: ausenciasData.slice(1),
        startY: yPos,
        margin: { left: 14 },
        theme: "grid",
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
        styles: { fontSize: 10 }
      });
      
      // SECCIÓN 3: Guardias por día y tramo (Nueva página)
      doc.addPage();
      yPos = addHeader();
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Guardias por día y tramo horario", 14, yPos);
      yPos += 10;
      
      const tablaCabecerasDiaTramo = ["Día", ...tramosHorarios];
      const tablaDatosDiaTramo = guardiasPorDiayTramo.map(dia => {
        const row = [formatDate(dia.fecha)];
        dia.porTramo.forEach(t => {
          if (t.total > 0) {
            row.push(`A: ${t.asignadas}\nP: ${t.noAsignadas}\n${t.porcentajeAsignadas}%`);
          } else {
            row.push("-");
          }
        });
        return row;
      });
      
      // Dibujar tabla de guardias por día y tramo
      doc.autoTable({
        head: [tablaCabecerasDiaTramo],
        body: tablaDatosDiaTramo,
        startY: yPos,
        margin: { left: 14 },
        theme: "grid",
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
        styles: { fontSize: 8, cellPadding: 2 }
      });
      
      // SECCIÓN 4: Guardias por profesor (Nueva página)
      doc.addPage();
      yPos = addHeader();
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Guardias por profesor", 14, yPos);
      yPos += 10;
      
      const profesoresHeaders = ["Profesor", "Total", "Firmadas", "Horas Totales", "Horas Firmadas", ...tramosHorarios];
      const profesoresData = guardiasPorProfesor.map(prof => {
        const row = [
          prof.profesorNombre,
          prof.total.toString(),
          prof.firmadas.toString(),
          prof.horasTotales.toFixed(1),
          prof.horasFirmadas.toFixed(1)
        ];
        
        tramosHorarios.forEach(tr => {
          const tramoData = prof.porTramo.find(t => t.tramo === tr);
          if (tramoData && tramoData.total > 0) {
            row.push(`${tramoData.total} (${tramoData.horas.toFixed(1)}h)`);
          } else {
            row.push("-");
          }
        });
        
        return row;
      });
      
      // Dibujar tabla de guardias por profesor
      doc.autoTable({
        head: [profesoresHeaders],
        body: profesoresData,
        startY: yPos,
        margin: { left: 14 },
        theme: "grid",
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
        styles: { fontSize: 8, cellPadding: 2 }
      });
      
      // Guardar el PDF
      doc.save(`estadisticas-guardias-${new Date().toISOString().split("T")[0]}.pdf`);
      
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Ocurrió un error al generar el PDF. Inténtalo de nuevo.");
    }
  };

  // ------------------------------
  // EXPORTAR A EXCEL
  // ------------------------------
  const exportToExcel = () => {
    // Crear workbook
    const wb = XLSX.utils.book_new();
    
    // Datos para resumen de guardias
    const guardiasData = [
      ["Estado", "Cantidad", "Porcentaje"],
      ["Pendientes", pendientes.toString(), total > 0 ? `${Math.round((pendientes / total) * 100)}%` : "0%"],
      ["Asignadas", asignadas.toString(), total > 0 ? `${Math.round((asignadas / total) * 100)}%` : "0%"],
      ["Firmadas", firmadas.toString(), total > 0 ? `${Math.round((firmadas / total) * 100)}%` : "0%"],
      ["Anuladas", anuladas.toString(), total > 0 ? `${Math.round((anuladas / total) * 100)}%` : "0%"],
      ["Total", total.toString(), "100%"]
    ];
    const guardiasWS = XLSX.utils.aoa_to_sheet(guardiasData);
    XLSX.utils.book_append_sheet(wb, guardiasWS, "Resumen Guardias");
    
    // Datos para resumen de ausencias
    const ausenciasData = [
      ["Estado", "Cantidad", "Porcentaje"],
      ["Pendientes", ausenciasPendientes.toString(), totalAusencias > 0 ? `${Math.round((ausenciasPendientes / totalAusencias) * 100)}%` : "0%"],
      ["Aceptadas", ausenciasAceptadas.toString(), totalAusencias > 0 ? `${Math.round((ausenciasAceptadas / totalAusencias) * 100)}%` : "0%"],
      ["Rechazadas", ausenciasRechazadas.toString(), totalAusencias > 0 ? `${Math.round((ausenciasRechazadas / totalAusencias) * 100)}%` : "0%"],
      ["Total", totalAusencias.toString(), "100%"]
    ];
    const ausenciasWS = XLSX.utils.aoa_to_sheet(ausenciasData);
    XLSX.utils.book_append_sheet(wb, ausenciasWS, "Resumen Ausencias");
    
    // Datos para guardias por profesor detallado
    const profesoresHeaders = ["Profesor", "Total Guardias", "Firmadas", "Horas Totales", "Horas Firmadas", "% Firmado"];
    // Añadir tramos horarios como columnas adicionales
    tramosHorarios.forEach(tramo => {
      profesoresHeaders.push(tramo);
    });
    
    const profesoresData = [profesoresHeaders];
    
    guardiasPorProfesor.forEach(p => {
      const row = [
        p.profesorNombre,
        p.total.toString(),
        p.firmadas.toString(),
        p.horasTotales.toFixed(1).toString(),
        p.horasFirmadas.toFixed(1).toString(),
        p.firmadas > 0 ? `${Math.round((p.firmadas / p.total) * 100)}%` : "0%"
      ];
      
      // Añadir datos de tramos
      p.porTramo.forEach(tramoData => {
        row.push(tramoData.total > 0 ? 
          `${tramoData.total} (${tramoData.horas.toFixed(1)}h)` : 
          "-");
      });
      
      profesoresData.push(row);
    });
    
    const profesoresWS = XLSX.utils.aoa_to_sheet(profesoresData);
    XLSX.utils.book_append_sheet(wb, profesoresWS, "Guardias por Profesor");
    
    // Datos para guardias por día y tramo horario (detallado)
    const diasYTramosHeaders = ["Día", ...tramosHorarios.map(t => `${t} - Total`), ...tramosHorarios.map(t => `${t} - Asignadas`), ...tramosHorarios.map(t => `${t} - No Asignadas`), ...tramosHorarios.map(t => `${t} - % Asignado`)];
    const diasYTramosData = [diasYTramosHeaders];
    
    guardiasPorDiayTramo.forEach(dia => {
      const row = [formatDate(dia.fecha)];
      
      // Añadir totales por tramo
      dia.porTramo.forEach(tramoData => {
        row.push(tramoData.total.toString());
      });
      
      // Añadir asignadas por tramo
      dia.porTramo.forEach(tramoData => {
        row.push(tramoData.asignadas.toString());
      });
      
      // Añadir no asignadas por tramo
      dia.porTramo.forEach(tramoData => {
        row.push(tramoData.noAsignadas.toString());
      });
      
      // Añadir porcentaje de asignación por tramo
      dia.porTramo.forEach(tramoData => {
        row.push(tramoData.total > 0 ? `${tramoData.porcentajeAsignadas}%` : "0%");
      });
      
      diasYTramosData.push(row);
    });
    
    const diasYTramosWS = XLSX.utils.aoa_to_sheet(diasYTramosData);
    XLSX.utils.book_append_sheet(wb, diasYTramosWS, "Guardias Detalle Diario");
    
    // Datos para guardias por profesor y lugar (desglosado por tramo)
    guardiasPorProfesor.forEach((profesor, index) => {
      if (profesor.porLugar.length > 0) {
        const profesorLugarHeaders = ["Lugar", "Total", "Horas", ...tramosHorarios];
        const profesorLugarData = [profesorLugarHeaders];
        
        profesor.porLugar.forEach(lugar => {
          const row = [
            `${lugar.lugarCodigo} - ${lugar.lugarDescripcion}`,
            lugar.total.toString(),
            lugar.horas.toFixed(1).toString()
          ];
          
          lugar.porTramo.forEach(tramoData => {
            row.push(tramoData.total > 0 ? 
              `${tramoData.total}\n(${tramoData.horas.toFixed(1)}h)` : 
              "-");
          });
          
          profesorLugarData.push(row);
        });
        
        // Limitar nombre de la hoja a 31 caracteres (límite de Excel)
        let sheetName = `Prof ${index+1} - ${profesor.profesorNombre}`.replace(/[\\\/\*\?\[\]]/g, "_");
        if (sheetName.length > 31) {
          sheetName = sheetName.substring(0, 28) + "...";
        }
        
        const profesorLugarWS = XLSX.utils.aoa_to_sheet(profesorLugarData);
        XLSX.utils.book_append_sheet(wb, profesorLugarWS, sheetName);
      }
    });
    
    // Datos para lugares
    const lugaresData = [
      ["Lugar", "Guardias", "Porcentaje"]
    ];
    guardiasPorLugarData.filter(item => item.total > 0).forEach(item => {
      lugaresData.push([
        `${item.lugarCodigo} - ${item.lugarDescripcion}`,
        item.total.toString(),
        (item.total > 0 ? Math.round(((item.total / total) * 100)) : 0).toString() + "%"
      ]);
    });
    const lugaresWS = XLSX.utils.aoa_to_sheet(lugaresData);
    XLSX.utils.book_append_sheet(wb, lugaresWS, "Lugares");
    
    // Datos para ausencias por profesor
    const ausenciasProfesoresData = [
      ["Profesor", "Ausencias", "Porcentaje"]
    ];
    ausenciasPorProfesorData.forEach(p => {
      ausenciasProfesoresData.push([
        p.profesorNombre,
        p.total.toString(),
        (ausenciasAceptadas > 0 ? Math.round(((p.total / ausenciasAceptadas) * 100)) : 0).toString() + "%"
      ]);
    });
    const ausenciasProfesoresWS = XLSX.utils.aoa_to_sheet(ausenciasProfesoresData);
    XLSX.utils.book_append_sheet(wb, ausenciasProfesoresWS, "Ausencias por Profesor");
    
    // Guardar archivo
    XLSX.writeFile(wb, `estadisticas-guardias-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  // ------------------------------
  // EXPORTAR A CSV
  // ------------------------------
  const exportToCSV = () => {
    // Crear un objeto con todos los datos para exportar
    const allData = {
      resumenGuardias: {
        headers: ["Estado", "Cantidad", "Porcentaje"],
        rows: [
          ["Pendientes", pendientes.toString(), total > 0 ? `${Math.round((pendientes / total) * 100)}%` : "0%"],
          ["Asignadas", asignadas.toString(), total > 0 ? `${Math.round((asignadas / total) * 100)}%` : "0%"],
          ["Firmadas", firmadas.toString(), total > 0 ? `${Math.round((firmadas / total) * 100)}%` : "0%"],
          ["Anuladas", anuladas.toString(), total > 0 ? `${Math.round((anuladas / total) * 100)}%` : "0%"],
          ["Total", total.toString(), "100%"]
        ]
      },
      resumenAusencias: {
        headers: ["Estado", "Cantidad", "Porcentaje"],
        rows: [
          ["Pendientes", ausenciasPendientes.toString(), totalAusencias > 0 ? `${Math.round((ausenciasPendientes / totalAusencias) * 100)}%` : "0%"],
          ["Aceptadas", ausenciasAceptadas.toString(), totalAusencias > 0 ? `${Math.round((ausenciasAceptadas / totalAusencias) * 100)}%` : "0%"],
          ["Rechazadas", ausenciasRechazadas.toString(), totalAusencias > 0 ? `${Math.round((ausenciasRechazadas / totalAusencias) * 100)}%` : "0%"],
          ["Total", totalAusencias.toString(), "100%"]
        ]
      },
      guardiasPorProfesor: {
        headers: ["Profesor", "Total Guardias", "Firmadas", "Horas Totales", "Horas Firmadas", "% Firmado"],
        rows: guardiasPorProfesor.map(p => [
          p.profesorNombre,
          p.total.toString(),
          p.firmadas.toString(),
          p.horasTotales.toFixed(1),
          p.horasFirmadas.toFixed(1),
          p.firmadas > 0 ? `${Math.round((p.firmadas / p.total) * 100)}%` : "0%"
        ])
      },
      guardiasPorTipo: {
        headers: ["Tipo", "Guardias", "Porcentaje"],
        rows: guardiasPorTipoData.map(item => [
          item.tipo,
          item.total.toString(),
          item.total > 0 ? `${Math.round(((item.total / total) * 100))}%` : "0%"
        ])
      },
      guardiasPorDiaYTramo: {
        headers: ["Día", ...tramosHorarios.map(t => `${t} - Total`), ...tramosHorarios.map(t => `${t} - Asignadas`), ...tramosHorarios.map(t => `${t} - No Asignadas`), ...tramosHorarios.map(t => `${t} - % Asignado`)],
        rows: guardiasPorDiayTramo.map(dia => {
          const row = [formatDate(dia.fecha)];
          
          // Añadir totales por tramo
          dia.porTramo.forEach(tramoData => {
            row.push(tramoData.total.toString());
          });
          
          // Añadir asignadas por tramo
          dia.porTramo.forEach(tramoData => {
            row.push(tramoData.asignadas.toString());
          });
          
          // Añadir no asignadas por tramo
          dia.porTramo.forEach(tramoData => {
            row.push(tramoData.noAsignadas.toString());
          });
          
          // Añadir porcentaje de asignación por tramo
          dia.porTramo.forEach(tramoData => {
            row.push(tramoData.total > 0 ? `${tramoData.porcentajeAsignadas}%` : "0%");
          });
          
          return row;
        })
      },
      profesoresDetalle: guardiasPorProfesor.map(profesor => {
        if (profesor.porLugar.length > 0) {
          return {
            nombreProfesor: profesor.profesorNombre,
            totalGuardias: profesor.total,
            headers: ["Lugar", "Total", "Horas", ...tramosHorarios],
            rows: profesor.porLugar.map(lugar => {
              const row = [
                `${lugar.lugarCodigo} - ${lugar.lugarDescripcion}`,
                lugar.total.toString(),
                lugar.horas.toFixed(1)
              ];
              
              lugar.porTramo.forEach(tramoData => {
                row.push(tramoData.total > 0 ? 
                  `${tramoData.total}\n(${tramoData.horas.toFixed(1)}h)` : 
                  "-");
              });
              
              return row;
            })
          };
        }
        return null;
      }).filter(Boolean)
    };
    
    // Función para crear contenido CSV a partir de datos
    const createCSV = (headers: string[], rows: any[]) => {
      let csvContent = headers.join(",") + "\r\n";
      rows.forEach(row => {
        // Asegurarse de que los campos con comas estén entre comillas
        const processedRow = row.map((field: any) => {
          const fieldStr = String(field);
          return fieldStr.includes(",") ? `"${fieldStr}"` : fieldStr;
        });
        csvContent += processedRow.join(",") + "\r\n";
      });
      return csvContent;
    };
    
    // Crear un archivo zip con todos los CSVs
    const createZip = async () => {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Añadir archivos al zip
      zip.file("resumen_guardias.csv", createCSV(allData.resumenGuardias.headers, allData.resumenGuardias.rows));
      zip.file("resumen_ausencias.csv", createCSV(allData.resumenAusencias.headers, allData.resumenAusencias.rows));
      zip.file("guardias_por_profesor.csv", createCSV(allData.guardiasPorProfesor.headers, allData.guardiasPorProfesor.rows));
      zip.file("guardias_por_tipo.csv", createCSV(allData.guardiasPorTipo.headers, allData.guardiasPorTipo.rows));
      zip.file("guardias_por_dia_y_tramo.csv", createCSV(allData.guardiasPorDiaYTramo.headers, allData.guardiasPorDiaYTramo.rows));
      
      // Añadir archivos por profesor
      allData.profesoresDetalle.forEach((profesor: any, index: number) => {
        if (profesor && profesor.rows.length > 0) {
          zip.file(`profesor_${index+1}_${profesor.nombreProfesor.replace(/[\\\/\*\?\[\]]/g, "_")}.csv`, 
                  createCSV(profesor.headers, profesor.rows));
        }
      });
      
      // Generar el zip
      const content = await zip.generateAsync({type: "blob"});
      
      // Crear enlace para descarga
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `estadisticas-guardias-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    // Ejecutar función para crear y descargar el zip
    createZip().catch(err => {
      console.error('Error al crear el archivo ZIP:', err);
      alert('Hubo un error al generar los archivos CSV. Por favor, intente con otro formato de exportación.');
    });
  }

  // --------------------------------------------------------------
  // RENDER PRINCIPAL DE LA PÁGINA
  // --------------------------------------------------------------
  return (
    <div className="container-fluid">
      <h1 className="mb-4">Estadísticas</h1>

      {/* Período y botones de exportación */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Periodo de análisis</span>
          <div className="btn-group">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={exportToPDF}
              title="Exportar a PDF"
            >
              <i className="bi bi-file-earmark-pdf"></i> PDF
            </button>
            <button
              className="btn btn-sm btn-outline-success"
              onClick={exportToExcel}
              title="Exportar a Excel"
            >
              <i className="bi bi-file-earmark-excel"></i> Excel
            </button>
            <button
              className="btn btn-sm btn-outline-info"
              onClick={exportToCSV}
              title="Exportar a CSV"
            >
              <i className="bi bi-file-earmark-text"></i> CSV
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-2">
              <label htmlFor="periodoInicio" className="form-label">
                Fecha de inicio
              </label>
              <input
                type="date"
                id="periodoInicio"
                className="form-control"
                value={periodoInicio}
                onChange={handlePeriodoInicioChange}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="periodoFin" className="form-label">
                Fecha de fin
              </label>
              <input
                type="date"
                id="periodoFin"
                className="form-control"
                value={periodoFin}
                onChange={handlePeriodoFinChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de Guardias y Ausencias */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Resumen de Guardias</div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Pendientes
                  <span className="badge text-bg-warning">{pendientes}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Asignadas
                  <span className="badge text-bg-primary">{asignadas}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Firmadas
                  <span className="badge text-bg-success">{firmadas}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Anuladas
                  <span className="badge text-bg-danger">{anuladas}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                  Total
                  <span className="badge text-bg-dark">{total}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Resumen de Ausencias</div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Pendientes
                  <span className="badge text-bg-warning">{ausenciasPendientes}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Aceptadas
                  <span className="badge text-bg-success">{ausenciasAceptadas}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Rechazadas
                  <span className="badge text-bg-danger">{ausenciasRechazadas}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                  Total
                  <span className="badge text-bg-dark">{totalAusencias}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Guardias por tipo */}
      <div className="card mb-4">
        <div className="card-header">Guardias por tipo</div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Guardias</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {guardiasPorTipoData.map((tipo) => (
                  <tr key={tipo.tipo}>
                    <td>{tipo.tipo}</td>
                    <td>{tipo.total}</td>
                    <td>
                      {tipo.total > 0
                        ? `${Math.round((tipo.total / total) * 100)}%`
                        : "0%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Guardias por día y tramo */}
      <div className="card mb-4">
        <div className="card-header">Guardias por día y tramo horario</div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Día</th>
                  {tramosHorarios.map((tramo) => (
                    <th key={tramo}>{tramo}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guardiasPorDiayTramo.map((dia) => (
                  <tr key={dia.fecha}>
                    <td>{formatDate(dia.fecha)}</td>
                    {dia.porTramo.map((t) => (
                      <td key={t.tramo} className="text-center">
                        {t.total > 0 ? (
                          <>
                            <div>Total: {t.total}</div>
                            <div className="small text-success">
                              Asignadas: {t.asignadas}
                            </div>
                            <div className="small text-danger">
                              Pendientes: {t.noAsignadas}
                            </div>
                            <div className="progress mt-1" style={{ height: "4px" }}>
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${t.porcentajeAsignadas}%` }}
                              ></div>
                            </div>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Guardias por profesor */}
      <div className="card mb-4">
        <div className="card-header">Guardias por profesor</div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Profesor</th>
                  <th>Total</th>
                  <th>Firmadas</th>
                  <th>Horas Totales</th>
                  <th>Horas Firmadas</th>
                  {tramosHorarios.map((t) => (
                    <th key={t}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guardiasPorProfesor.map((prof) => (
                  <tr key={prof.profesorId}>
                    <td>{prof.profesorNombre}</td>
                    <td>{prof.total}</td>
                    <td>{prof.firmadas}</td>
                    <td>{prof.horasTotales.toFixed(1)}</td>
                    <td>{prof.horasFirmadas.toFixed(1)}</td>
                    {prof.porTramo.map((tr) => (
                      <td key={tr.tramo}>
                        {tr.total > 0
                          ? `${tr.total} (${tr.horas.toFixed(1)}h)`
                          : "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detalle de lugares por profesor */}
      <div className="card mb-4">
        <div className="card-header">Detalle de guardias por profesor y lugar</div>
        <div className="card-body">
          <div className="accordion" id="accordionProfesores">
            {guardiasPorProfesor.map((prof) => (
              <div className="accordion-item" key={prof.profesorId}>
                <h2
                  className="accordion-header"
                  id={`heading${prof.profesorId}`}
                >
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${prof.profesorId}`}
                    aria-expanded="false"
                    aria-controls={`collapse${prof.profesorId}`}
                  >
                    {prof.profesorNombre} - {prof.total} guardias (
                    {prof.horasTotales.toFixed(1)}h)
                  </button>
                </h2>
                <div
                  id={`collapse${prof.profesorId}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading${prof.profesorId}`}
                  data-bs-parent="#accordionProfesores"
                >
                  <div className="accordion-body">
                    <h5>Guardias por lugar</h5>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Lugar</th>
                            <th>Total</th>
                            <th>Horas</th>
                            {tramosHorarios.map((tramo) => (
                              <th key={tramo}>{tramo}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {prof.porLugar.map((lugar) => (
                            <tr key={lugar.lugarId}>
                              <td>
                                {lugar.lugarCodigo} - {lugar.lugarDescripcion}
                              </td>
                              <td>{lugar.total}</td>
                              <td>{lugar.horas.toFixed(1)}</td>
                              {lugar.porTramo.map((t) => (
                                <td key={t.tramo}>
                                  {t.total > 0
                                    ? `${t.total} (${t.horas.toFixed(1)}h)`
                                    : "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lugares más utilizados */}
      <div className="card mb-4">
        <div className="card-header">Lugares más utilizados</div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Lugar</th>
                  <th>Guardias</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {guardiasPorLugarData
                  .filter((item) => item.total > 0)
                  .map((item) => (
                    <tr key={item.lugarId}>
                      <td>
                        {item.lugarCodigo} - {item.lugarDescripcion}
                      </td>
                      <td>{item.total}</td>
                      <td>
                        {item.total > 0
                          ? `${Math.round((item.total / total) * 100)}%`
                          : "0%"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ausencias aceptadas por profesor */}
      <div className="card mb-4">
        <div className="card-header">Ausencias aceptadas por profesor</div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Profesor</th>
                  <th>Ausencias Aceptadas</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {ausenciasPorProfesorData.map((p) => (
                  <tr key={p.profesorId}>
                    <td>{p.profesorNombre}</td>
                    <td>{p.total}</td>
                    <td>
                      {ausenciasAceptadas > 0
                        ? `${Math.round((p.total / ausenciasAceptadas) * 100)}%`
                        : "0%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}