'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project } from '@/lib/types'

interface ProjectContextType {
  projects: Project[]
  selectedProjectId: string | null
  selectedProject: Project | null
  setSelectedProjectId: (id: string | null) => void
  refreshProjects: () => Promise<void>
  loading: boolean
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    // Load selected project from localStorage
    const saved = localStorage.getItem('vibeos-selected-project')
    if (saved && saved !== 'null') {
      setSelectedProjectIdState(saved)
    }
    fetchProjects()
  }, [])

  async function fetchProjects() {
    setLoading(true)
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('archived', false)
      .order('name', { ascending: true })
    
    setProjects(data || [])
    setLoading(false)
  }

  function setSelectedProjectId(id: string | null) {
    setSelectedProjectIdState(id)
    if (id) {
      localStorage.setItem('vibeos-selected-project', id)
    } else {
      localStorage.removeItem('vibeos-selected-project')
    }
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null

  return (
    <ProjectContext.Provider value={{
      projects,
      selectedProjectId,
      selectedProject,
      setSelectedProjectId,
      refreshProjects: fetchProjects,
      loading,
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
