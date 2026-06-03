'use client'

import { AppShell } from '@/components/layout/app-shell'
import { ProjectsContent } from './projects-content'

export default function ProjectsPage() {
  return (
    <AppShell currentPage="projects">
      <ProjectsContent />
    </AppShell>
  )
}
