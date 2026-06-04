'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, PROJECT_COLORS, ProjectColor } from '@/lib/types'
import { Plus, Archive, ArchiveRestore, Edit3, Trash2, X, FolderOpen, Github, Link, Unlink, Loader2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface GithubRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  private: boolean
  updated_at: string
}

export function ProjectsContent({ githubConnected }: { githubConnected: boolean }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // GitHub repo linking
  const [showRepoModal, setShowRepoModal] = useState(false)
  const [repoLinkingProject, setRepoLinkingProject] = useState<Project | null>(null)
  const [repos, setRepos] = useState<GithubRepo[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [repoSearch, setRepoSearch] = useState('')
  
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
    if (!user) return

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
    toast.success('Project deleted')
  }

  async function openRepoLinkModal(project: Project) {
    setRepoLinkingProject(project)
    setShowRepoModal(true)
    setRepoSearch('')
    
    if (repos.length === 0) {
      setLoadingRepos(true)
      const response = await fetch('/api/github/repos')
      if (response.ok) {
        const data = await response.json()
        setRepos(data.repos || [])
      } else {
        toast.error('Failed to load repositories')
      }
      setLoadingRepos(false)
    }
  }

  async function linkRepo(repo: GithubRepo) {
    if (!repoLinkingProject) return
    
    const { error } = await supabase
      .from('projects')
      .update({
        github_repo_url: repo.html_url,
        github_repo_name: repo.name,
        github_repo_full_name: repo.full_name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', repoLinkingProject.id)

    if (error) {
      toast.error('Failed to link repository')
    } else {
      toast.success(`Linked ${repo.name} to ${repoLinkingProject.name}`)
      fetchProjects()
    }
    setShowRepoModal(false)
  }

  async function unlinkRepo(project: Project) {
    const { error } = await supabase
      .from('projects')
      .update({
        github_repo_url: null,
        github_repo_name: null,
        github_repo_full_name: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', project.id)

    if (error) {
      toast.error('Failed to unlink repository')
    } else {
      toast.success('Repository unlinked')
      fetchProjects()
    }
  }

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(repoSearch.toLowerCase())
  )

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

              {/* GitHub Repo Link */}
              {project.github_repo_full_name ? (
                <div className="flex items-center gap-2 mb-4 p-2 bg-gray-100 rounded-lg border-2 border-black">
                  <Github className="w-4 h-4" />
                  <a 
                    href={project.github_repo_url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline flex-1 truncate"
                  >
                    {project.github_repo_full_name}
                  </a>
                  <button
                    onClick={() => unlinkRepo(project)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Unlink repository"
                  >
                    <Unlink className="w-3 h-3" />
                  </button>
                  <a
                    href={project.github_repo_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Open in GitHub"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : githubConnected && !project.archived ? (
                <button
                  onClick={() => openRepoLinkModal(project)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors w-full"
                >
                  <Github className="w-4 h-4" />
                  <span>Link GitHub repository</span>
                </button>
              ) : null}
              
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

      {/* Repository Selection Modal */}
      {showRepoModal && repoLinkingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-3xl p-6 w-full max-w-lg neo-shadow animate-bounce-in max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black">Link Repository</h2>
                <p className="text-sm text-gray-600">to {repoLinkingProject.name}</p>
              </div>
              <button
                onClick={() => setShowRepoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search repositories..."
              value={repoSearch}
              onChange={(e) => setRepoSearch(e.target.value)}
              className="neo-input w-full mb-4"
            />

            {/* Repo List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {loadingRepos ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Github className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No repositories found</p>
                  {repoSearch && <p className="text-sm">Try a different search term</p>}
                </div>
              ) : (
                filteredRepos.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => linkRepo(repo)}
                    className="w-full text-left p-3 border-3 border-black rounded-xl hover:bg-gray-50 transition-colors flex items-start gap-3"
                  >
                    <Github className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{repo.full_name}</p>
                      {repo.description && (
                        <p className="text-sm text-gray-600 truncate">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {repo.private && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full">Private</span>
                        )}
                        <span className="text-xs text-gray-400">
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
