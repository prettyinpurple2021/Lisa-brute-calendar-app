import { Github, Check, Unlink, Loader2 } from 'lucide-react'

interface GithubSettingsProps {
  githubConnected: boolean
  githubUsername: string | null
  disconnectGithub: () => Promise<void>
  disconnectingGithub: boolean
  connectGithub: () => Promise<void>
}

export function GithubSettings({
  githubConnected,
  githubUsername,
  disconnectGithub,
  disconnectingGithub,
  connectGithub,
}: GithubSettingsProps) {
  return (
    <div className="border-4 border-black rounded-3xl p-6 bg-white neo-shadow">
      <h3 className="text-lg font-black flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center border-2 border-black">
          <Github className="w-4 h-4 text-white" />
        </div>
        GitHub Integration
      </h3>

      {githubConnected ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border-4 border-black rounded-xl bg-lime/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-lime flex items-center justify-center border-2 border-black">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold">GitHub Connected</p>
                {githubUsername && (
                  <p className="text-sm text-gray-600">@{githubUsername}</p>
                )}
              </div>
            </div>
            <button
              onClick={disconnectGithub}
              disabled={disconnectingGithub}
              className="flex items-center gap-2 px-4 py-2 border-4 border-black rounded-xl font-bold bg-white hover:bg-red-50 text-red-600 transition-colors neo-hover"
            >
              {disconnectingGithub ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Unlink className="w-4 h-4" />
              )}
              Disconnect
            </button>
          </div>
          <p className="text-sm text-gray-600">
            You can link GitHub repositories to your projects from the Projects page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            Connect your GitHub account to link repositories to your projects and track your coding progress.
          </p>
          <button
            onClick={connectGithub}
            className="flex items-center gap-2 px-6 py-3 border-4 border-black rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors neo-hover"
          >
            <Github className="w-5 h-5" />
            Connect GitHub
          </button>
        </div>
      )}
    </div>
  )
}
