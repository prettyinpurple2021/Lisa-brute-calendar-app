'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, Sparkles, Bot, User, Loader2, Trash2, Calendar, CheckSquare, Lightbulb, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts || !Array.isArray(message.parts)) return ''
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text' && typeof p.text === 'string')
    .map((p) => p.text)
    .join('')
}

export function AIChatContent() {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  const handleClearChat = () => {
    setMessages([])
  }

  const quickPrompts = [
    { icon: Calendar, label: "What's on my calendar today?", color: 'bg-primary' },
    { icon: CheckSquare, label: 'What tasks should I focus on?', color: 'bg-secondary' },
    { icon: Lightbulb, label: 'Help me brainstorm app ideas', color: 'bg-accent' },
    { icon: Zap, label: 'Give me a productivity tip', color: 'bg-lime' },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-hot-orange neo-border rounded-full flex items-center justify-center float-animation">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">VibeBot</h1>
            <p className="text-sm text-muted-foreground">Your AI co-founder assistant</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            className="neo-border neo-hover"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto neo-border rounded-xl bg-card p-4 mb-4 neo-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary neo-border rounded-full flex items-center justify-center mb-6 float-animation">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black mb-2">Hey there, founder!</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              I&apos;m VibeBot, your AI co-founder. I can help you manage tasks, check your calendar, track habits, and brainstorm ideas for your 7 apps!
            </p>
            
            {/* Quick Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(prompt.label)
                    inputRef.current?.focus()
                  }}
                  className={`flex items-center gap-3 p-3 neo-border rounded-lg ${prompt.color} neo-hover text-left transition-all`}
                >
                  <prompt.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isUser = message.role === 'user'
              const text = getMessageText(message)
              
              // Check for tool calls
              const toolParts = message.parts?.filter(p => p.type === 'tool-invocation') || []
              
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''} bounce-in`}
                >
                  <div
                    className={`w-10 h-10 rounded-full neo-border flex items-center justify-center flex-shrink-0 ${
                      isUser ? 'bg-primary' : 'bg-hot-orange'
                    }`}
                  >
                    {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div
                    className={`max-w-[80%] neo-border rounded-xl p-4 ${
                      isUser ? 'bg-primary/20' : 'bg-card'
                    }`}
                  >
                    {text && (
                      <p className="whitespace-pre-wrap">{text}</p>
                    )}
                    
                    {/* Tool invocations */}
                    {toolParts.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {toolParts.map((part, idx) => {
                          if (part.type !== 'tool-invocation') return null
                          const toolPart = part as { type: 'tool-invocation'; toolInvocation: { toolName: string; state: string } }
                          return (
                            <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                              {toolPart.toolInvocation.state === 'call' || toolPart.toolInvocation.state === 'partial-call' ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3 text-accent" />
                              )}
                              <span className="font-mono">
                                {toolPart.toolInvocation.toolName.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            
            {/* Loading indicator */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-start gap-3 bounce-in">
                <div className="w-10 h-10 rounded-full neo-border flex items-center justify-center bg-hot-orange">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="neo-border rounded-xl p-4 bg-card">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your tasks, schedule, or ideas..."
            disabled={isLoading}
            className="w-full px-4 py-3 pr-12 neo-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 font-medium"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-muted rounded">Enter</kbd>
          </div>
        </div>
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="neo-border neo-hover bg-primary hover:bg-primary/90 px-6 py-3 h-auto"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>

      {/* Keyboard shortcut hint */}
      <p className="text-xs text-muted-foreground text-center mt-2">
        Pro tip: I can create tasks, check your calendar, and review your habits!
      </p>
    </div>
  )
}
