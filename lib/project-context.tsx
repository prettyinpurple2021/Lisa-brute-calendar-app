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
    // Load selected project from user preferences (real database)
    fetchProjectsAndPreferences()
  }, [])

  async function fetchProjectsAndPreferences() {
    setLoading(true)
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    // Fetch all projects
    const { data: projectsData } = await supabase
      .from('projects')
      .select('*')
      .eq('archived', false)
      .eq('user_id', user.id)
      .order('name', { ascending: true })
    
    setProjects(projectsData || [])

    // Fetch user preferences to get selected project
    const { data: prefsData } = await supabase
      .from('user_preferences')
      .select('selected_project_id')
      .eq('user_id', user.id)
      .single()
    
    if (prefsData?.selected_project_id) {
      setSelectedProjectIdState(prefsData.selected_project_id)
    }
    
    setLoading(false)
  }

  async function setSelectedProjectId(id: string | null) {
    setSelectedProjectIdState(id)
    
    // Persist to database
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({ user_id: user.id, selected_project_id: id })
    }
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null

  return (
    <ProjectContext.Provider value={{
      projects,
      selectedProjectId,
      selectedProject,
      setSelectedProjectId,
      refreshProjects: fetchProjectsAndPreferences,
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
