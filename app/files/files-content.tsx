'use client'

import { useState, useEffect, useCallback } from 'react'
import { Upload, File, Trash2, Download, FolderOpen, Image, FileText, FileArchive, Music, Video, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface FileItem {
  pathname: string
  size: number
  uploadedAt: string
  filename: string
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf']
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz']
  const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'm4a']
  const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm']
  
  if (imageExts.includes(ext || '')) return <Image className="w-5 h-5" />
  if (docExts.includes(ext || '')) return <FileText className="w-5 h-5" />
  if (archiveExts.includes(ext || '')) return <FileArchive className="w-5 h-5" />
  if (audioExts.includes(ext || '')) return <Music className="w-5 h-5" />
  if (videoExts.includes(ext || '')) return <Video className="w-5 h-5" />
  return <File className="w-5 h-5" />
}

function getFileColor(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf']
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz']
  const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'm4a']
  const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm']
  
  if (imageExts.includes(ext || '')) return 'bg-pink-400'
  if (docExts.includes(ext || '')) return 'bg-cyan-400'
  if (archiveExts.includes(ext || '')) return 'bg-yellow-400'
  if (audioExts.includes(ext || '')) return 'bg-purple-400'
  if (videoExts.includes(ext || '')) return 'bg-lime-400'
  return 'bg-orange-400'
}

export function FilesContent() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/files/list')
      if (!response.ok) throw new Error('Failed to fetch files')
      const data = await response.json()
      setFiles(data.files || [])
    } catch (err) {
      toast.error('Failed to load files')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    
    setIsUploading(true)
    setError(null)

    try {
      const uploadPromises = Array.from(fileList).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error('Upload failed')
      })

      await Promise.all(uploadPromises)
      
      await fetchFiles()
      toast.success(`${fileList.length} file${fileList.length > 1 ? 's' : ''} uploaded!`)
    } catch (err) {
      toast.error('Failed to upload file(s)')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (pathname: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname }),
      })

      if (!response.ok) throw new Error('Delete failed')
      
      setFiles(files.filter(f => f.pathname !== pathname))
      toast.success('File deleted!')
    } catch (err) {
      toast.error('Failed to delete file')
      console.error(err)
    }
  }

  const handleDownload = (pathname: string) => {
    window.open(`/api/files/download?pathname=${encodeURIComponent(pathname)}`, '_blank')
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleUpload(e.dataTransfer.files)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Files</h1>
          <p className="text-muted-foreground mt-1">Upload and manage your files</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FolderOpen className="w-4 h-4" />
          <span>{files.length} file{files.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        className={`neo-card p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-primary bg-primary/10 scale-[1.02]' 
            : 'border-dashed hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-4"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-black shadow-neo ${
            isUploading ? 'bg-muted animate-pulse' : 'bg-gradient-to-br from-pink-400 to-cyan-400'
          }`}>
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-foreground" />
            ) : (
              <Upload className="w-8 h-8 text-black" />
            )}
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              {isUploading ? 'Uploading...' : 'Drop files here or click to upload'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Support for images, documents, and more
            </p>
          </div>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="neo-card p-4 bg-destructive/20 border-destructive">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Files Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="neo-card p-4 animate-pulse">
              <div className="w-10 h-10 bg-muted rounded-lg mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No files yet</h3>
          <p className="text-muted-foreground">Upload your first file to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.pathname}
              className="neo-card p-4 group hover:translate-y-[-2px] transition-transform"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg border-2 border-black shadow-neo-sm flex items-center justify-center text-black ${getFileColor(file.filename)}`}>
                  {getFileIcon(file.filename)}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-cyan-400/20"
                    onClick={() => handleDownload(file.pathname)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
                    onClick={() => handleDelete(file.pathname)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground truncate" title={file.filename}>
                {file.filename}
              </h3>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
