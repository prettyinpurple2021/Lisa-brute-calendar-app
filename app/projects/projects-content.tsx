'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, PROJECT_COLORS, ProjectColor } from '@/lib/types'
import { Plus, Archive, ArchiveRestore, Edit3, Trash2, X, FolderOpen } from 'lucide-react'

export function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('📁')
  const [color, setColor] = useState<ProjectColor>('pink')

  const supabase = createClient()

  useEffect(() => {
    fetchProjects()
  }, [showArchived])

  async function fetchProjects() {
    setLoading(true)
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('archived', showArchived)
      .order('created_at', { ascending: false })
    
    setProjects(data || [])
    setLoading(false)
  }

  function openCreateModal() {
    setEditingProject(null)
    setName('')
    setDescription('')
    setIcon('📁')
    setColor('pink')
    setShowModal(true)
  }

  function openEditModal(project: Project) {
    setEditingProject(project)
    setName(project.name)
    setDescription(project.description || '')
    setIcon(project.icon)
    setColor(project.color)
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }

    if (editingProject) {
      await supabase
        .from('projects')
        .update({ name, description: description || null, icon, color, updated_at: new Date().toISOString() })
        .eq('id', editingProject.id)
    } else {
      await supabase
        .from('projects')
        .insert({ user_id: user.id, name, description: description || null, icon, color })
    }

    setSaving(false)
    setShowModal(false)
    fetchProjects()
  }

  async function handleArchive(project: Project) {
    await supabase
      .from('projects')
      .update({ archived: !project.archived, updated_at: new Date().toISOString() })
      .eq('id', project.id)
    fetchProjects()
  }

  async function handleDelete(project: Project) {
    if (!confirm(`Are you sure you want to permanently delete "${project.name}"? This will remove the project but keep all tasks, events, and other items.`)) return
    
    await supabase
      .from('projects')
      .delete()
      .eq('id', project.id)
    fetchProjects()
  }

  const getColorClass = (c: ProjectColor) => {
    const colorMap: Record<ProjectColor, string> = {
      pink: 'bg-hot-pink',
      cyan: 'bg-electric-cyan',
      yellow: 'bg-bright-yellow',
      lime: 'bg-lime',
      purple: 'bg-neon-purple',
      orange: 'bg-hot-orange',
      blue: 'bg-electric-blue',
    }
    return colorMap[c]
  }

  const ICON_OPTIONS = ['📁', '🚀', '💡', '🎯', '🔥', '⭐', '💎', '🌈', '🎨', '📱', '💻', '🌐', '📊', '🎮', '🛒', '📝']

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-foreground mb-2">Projects</h1>
          <p className="text-gray-600">Organize your work across multiple apps and ideas</p>
        </div>
        <button
          onClick={openCreateModal}
          className="neo-btn bg-primary text-primary-foreground flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Archive toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`neo-btn text-sm ${showArchived ? 'bg-gray-200' : 'bg-white'}`}
        >
          {showArchived ? <ArchiveRestore className="w-4 h-4 mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
          {showArchived ? 'Show Active' : 'Show Archived'}
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-4 border-black rounded-2xl p-6 bg-white animate-pulse h-40" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="border-4 border-black border-dashed rounded-2xl p-12 text-center bg-white/50">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2">
            {showArchived ? 'No archived projects' : 'No projects yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {showArchived 
              ? 'Projects you archive will appear here' 
              : 'Create your first project to organize your work'}
          </p>
          {!showArchived && (
            <button onClick={openCreateModal} className="neo-btn bg-primary text-primary-foreground">
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`border-4 border-black rounded-2xl p-6 neo-shadow hover:translate-y-[-2px] transition-transform ${
                project.archived ? 'opacity-60' : ''
              }`}
              style={{ backgroundColor: 'white' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl border-3 border-black flex items-center justify-center text-2xl ${getColorClass(project.color)}`}>
                    {project.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-600 line-clamp-1">{project.description}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEditModal(project)}
                  className="neo-btn text-sm p-2 bg-white"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleArchive(project)}
                  className="neo-btn text-sm p-2 bg-white"
                  title={project.archived ? 'Restore' : 'Archive'}
                >
                  {project.archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                </button>
                {project.archived && (
                  <button
                    onClick={() => handleDelete(project)}
                    className="neo-btn text-sm p-2 bg-destructive text-destructive-foreground"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-3xl p-6 w-full max-w-md neo-shadow animate-bounce-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">
                {editingProject ? 'Edit Project' : 'New Project'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Icon & Color */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-2">Icon</label>
                  <div className="grid grid-cols-8 gap-1">
                    {ICON_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setIcon(emoji)}
                        className={`w-8 h-8 rounded-lg border-2 text-lg flex items-center justify-center transition-all ${
                          icon === emoji 
                            ? 'border-black bg-gray-100 scale-110' 
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-bold mb-2">Color</label>
                <div className="flex gap-2">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-10 h-10 rounded-xl border-3 transition-all ${c.class} ${
                        color === c.value 
                          ? 'border-black scale-110 ring-2 ring-offset-2 ring-black' 
                          : 'border-black/30 hover:border-black'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Project"
                  className="neo-input w-full"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold mb-2">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project about?"
                  className="neo-input w-full resize-none"
                  rows={3}
                />
              </div>

              {/* Preview */}
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center text-xl ${getColorClass(color)}`}>
                    {icon}
                  </div>
                  <span className="font-bold">{name || 'Project Name'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="neo-btn flex-1 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="neo-btn flex-1 bg-primary text-primary-foreground disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
