"use client"

import type React from "react"
import { useChat } from "@ai-sdk/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageCircle, Sparkles, Brain, ArrowLeft, History, X, Trash2, Menu, MessageSquare } from "lucide-react"

interface ChatHistory {
  id: string
  title: string
  messages: any[]
  lastUpdated: Date
}

export default function NeumorphicChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat()
  const [hasStarted, setHasStarted] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('phil-chat-history')
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory))
    }
  }, [])

  // Save current chat to history
  const saveCurrentChat = () => {
    if (messages.length > 0) {
      const chatTitle = messages[0]?.content?.substring(0, 50) + "..." || "New Chat"
      const chatId = currentChatId || Date.now().toString()
      
      const newChat: ChatHistory = {
        id: chatId,
        title: chatTitle,
        messages: messages,
        lastUpdated: new Date()
      }

      const updatedHistory = chatHistory.filter(chat => chat.id !== chatId)
      updatedHistory.unshift(newChat)
      
      setChatHistory(updatedHistory.slice(0, 10)) // Keep only last 10 chats
      localStorage.setItem('phil-chat-history', JSON.stringify(updatedHistory.slice(0, 10)))
      setCurrentChatId(chatId)
    }
  }

  // Load a chat from history
  const loadChat = (chat: ChatHistory) => {
    setMessages(chat.messages)
    setCurrentChatId(chat.id)
    setHasStarted(true)
    setShowHistory(false)
  }

  // Start new chat
  const startNewChat = () => {
    saveCurrentChat()
    setMessages([])
    setCurrentChatId(null)
    setHasStarted(false)
    setShowHistory(false)
  }

  // Delete chat from history
  const deleteChat = (chatId: string) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId)
    setChatHistory(updatedHistory)
    localStorage.setItem('phil-chat-history', JSON.stringify(updatedHistory))
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!hasStarted) {
      setHasStarted(true)
    }
    handleSubmit(e)
  }

  // Auto-save chat when messages change
  useEffect(() => {
    if (messages.length > 0 && hasStarted) {
      const timeoutId = setTimeout(() => {
        saveCurrentChat()
      }, 2000) // Save 2 seconds after last message
      
      return () => clearTimeout(timeoutId)
    }
  }, [messages])

  // Welcome screen before chat starts
  if (!hasStarted && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Main welcome card */}
          <div className="bg-gray-100 rounded-3xl p-12 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] mb-8">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff] flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#009b4d] to-[#00b359] rounded-full shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Welcome text */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to True<span className="text-[#009b4d]">Story</span>.ai</h1>
              <p className="text-xl text-gray-600 mb-2">Hi, I'm <span className="text-[#009b4d] font-bold">Phil</span> your TrueStory assistant</p>
              <div className="flex items-center justify-center text-gray-500 mt-4">
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="text-sm">Autonomous AI agent with database access</span>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/database" 
                  className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-50 text-gray-700 rounded-2xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] transition-all duration-200 text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Database & Files Interface
                </a>
                <Button
                  onClick={() => {
                    setHasStarted(true)
                    setShowHistory(false)
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-50 text-gray-700 rounded-2xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] transition-all duration-200 text-sm font-medium border-0"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </div>

            {/* Input form */}
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="relative">
                <div className="bg-gray-100 rounded-2xl p-1 shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff]">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="What would you like me to analyze or investigate?"
                    className="bg-transparent border-0 text-lg px-6 py-4 focus:ring-0 focus:outline-none placeholder:text-gray-400"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-gray-100 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-2xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] transition-all duration-200 border-0 text-lg font-medium disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#009b4d] border-t-transparent rounded-full animate-spin mr-2" />
                      Starting...
                    </>
                  ) : (
                    <>
                      Start Conversation
                      <Send className="w-5 h-5 ml-2 text-[#009b4d]" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: MessageCircle, title: "Intelligent Analysis", desc: "Deep business insights" },
              { icon: Brain, title: "Autonomous Research", desc: "Multi-step investigation" },
              { icon: Sparkles, title: "Proactive Insights", desc: "Beyond what you ask" },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-2xl p-6 shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff] text-center"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-[#009b4d]" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Chat interface after conversation starts
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gray-100 shadow-[0_8px_16px_#bebebe,0_-2px_4px_#ffffff] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button
              onClick={() => setShowHistory(!showHistory)}
              className="mr-4 p-2 bg-gray-100 hover:bg-gray-50 rounded-xl shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] hover:shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] transition-all duration-200 border-0"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </Button>
            <a 
              href="/" 
              className="mr-4 p-2 bg-gray-100 hover:bg-gray-50 rounded-xl shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] hover:shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </a>
            <div className="w-12 h-12 bg-gray-100 rounded-xl shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center mr-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#009b4d] to-[#00b359] rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Phil - True<span className="text-[#009b4d]">Story</span>.ai</h1>
              <p className="text-sm text-gray-600">Your AI assistant</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={startNewChat}
              className="bg-gray-100 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] hover:shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] transition-all duration-200 border-0"
            >
              New Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
          {/* Overlay for mobile */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 lg:hidden" 
            onClick={() => setShowHistory(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 h-full w-80 bg-gray-100 shadow-[8px_0_16px_#bebebe] lg:relative lg:w-full lg:shadow-[0_4px_8px_#bebebe,0_-2px_4px_#ffffff] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Chat History</h3>
                <Button
                  onClick={() => setShowHistory(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-50 rounded-lg shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] border-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="h-full overflow-y-auto pb-20">
              {chatHistory.length === 0 ? (
                <p className="text-gray-600 text-center py-8 px-4">No chat history yet. Start a conversation to save it!</p>
              ) : (
                <div className="p-4 space-y-3">
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className="bg-gray-50 rounded-xl p-4 shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff] transition-all duration-200 cursor-pointer group"
                      onClick={() => loadChat(chat)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate text-sm">{chat.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(chat.lastUpdated).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {chat.messages.length} messages
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChat(chat.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 bg-red-100 hover:bg-red-200 rounded transition-all duration-200 border-0"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 px-6 py-8 pb-32 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-xs lg:max-w-2xl">
                {message.role === "assistant" && (
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center mr-2">
                      <Brain className="w-4 h-4 text-[#009b4d]" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">Phil</span>
                  </div>
                )}

                <div
                  className={`px-6 py-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-[#009b4d] to-[#00b359] text-white shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]"
                      : "bg-gray-100 text-gray-800 shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff]"
                  }`}
                >
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <div key={`${message.id}-${i}`} className="whitespace-pre-wrap leading-relaxed">
                          {part.text}
                        </div>
                      )
                    }
                    return null
                  })}
                </div>

                {message.role === "user" && (
                  <div className="flex items-center justify-end mt-2">
                    <span className="text-sm text-gray-600 font-medium mr-2">You</span>
                    <div className="w-8 h-8 bg-gray-100 rounded-lg shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center">
                      <div className="w-4 h-4 bg-gradient-to-br from-[#009b4d] to-[#00b359] rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-100 shadow-[0_-8px_16px_#bebebe,0_2px_4px_#ffffff] px-6 py-6 fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-4xl mx-auto">
          {isLoading && (
            <div className="mb-4 flex items-center justify-center">
              <div className="bg-gray-50 rounded-2xl px-4 py-2 shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center">
                  <Brain className="w-3 h-3 text-[#009b4d]" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#009b4d] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#009b4d] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-[#009b4d] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
                <span className="text-sm text-gray-600 font-medium">Phil is analyzing...</span>
              </div>
            </div>
          )}
          <form onSubmit={onSubmit} className="flex space-x-4">
            <div className="flex-1 bg-gray-100 rounded-2xl shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff] p-1">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Give me a task to analyze or investigate..."
                className="bg-transparent border-0 px-6 py-4 text-lg focus:ring-0 focus:outline-none placeholder:text-gray-400"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gray-100 hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-2xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 border-0 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-[#009b4d] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-6 h-6 text-[#009b4d]" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
