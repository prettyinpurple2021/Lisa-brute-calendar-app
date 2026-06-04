'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function exportToCSV(type: string, projectId?: string) {
  const params = new URLSearchParams({ type, format: 'csv' })
  if (projectId) params.set('projectId', projectId)
  
  const response = await fetch(`/api/export?${params}`)
  
  if (!response.ok) {
    throw new Error('Export failed')
  }
  
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `${type}-export.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function exportToPDF(type: string, projectId?: string) {
  const params = new URLSearchParams({ type, format: 'json' })
  if (projectId) params.set('projectId', projectId)
  
  const response = await fetch(`/api/export?${params}`)
  
  if (!response.ok) {
    throw new Error('Export failed')
  }
  
  const { data, filename } = await response.json()
  
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }
  
  // Create PDF
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.setTextColor(26, 26, 46) // Dark color
  doc.text(`${filename.charAt(0).toUpperCase() + filename.slice(1)} Export`, 14, 22)
  
  // Date
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
  
  // Table
  const headers = Object.keys(data[0])
  const rows = data.map((row: Record<string, unknown>) => headers.map(h => String(row[h] || '')))
  
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 38,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [26, 26, 46],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
  })
  
  // Save
  doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`)
}

export type ExportType = 'tasks' | 'events' | 'habits' | 'notes' | 'time-sessions'
