"use client"

import type React from "react"
import { useChat } from "@ai-sdk/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageCircle, Sparkles, Brain } from "lucide-react"

export default function NeumorphicChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const [hasStarted, setHasStarted] = useState(false)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!hasStarted) {
      setHasStarted(true)
    }
    handleSubmit(e)
  }

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
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to AI Assistant</h1>
              <p className="text-xl text-gray-600 mb-2">How can I help you today?</p>
              <div className="flex items-center justify-center text-gray-500 mt-4">
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="text-sm">Powered by advanced AI technology</span>
              </div>
            </div>

            {/* Input form */}
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="relative">
                <div className="bg-gray-100 rounded-2xl p-1 shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff]">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask me anything..."
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
              { icon: MessageCircle, title: "Natural Conversation", desc: "Chat naturally with AI" },
              { icon: Brain, title: "Smart Responses", desc: "Get intelligent answers" },
              { icon: Sparkles, title: "Always Learning", desc: "Continuously improving" },
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
            <div className="w-12 h-12 bg-gray-100 rounded-xl shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center mr-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#009b4d] to-[#00b359] rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
              <p className="text-sm text-gray-600">Always here to help</p>
            </div>
          </div>

          <Button
            onClick={() => {
              setHasStarted(false)
              window.location.reload()
            }}
            className="bg-gray-100 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] hover:shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] transition-all duration-200 border-0"
          >
            New Chat
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-xs lg:max-w-2xl">
                {message.role === "assistant" && (
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center mr-2">
                      <Brain className="w-4 h-4 text-[#009b4d]" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">AI Assistant</span>
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

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-2xl">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center mr-2">
                    <Brain className="w-4 h-4 text-[#009b4d]" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">AI Assistant</span>
                </div>

                <div className="bg-gray-100 px-6 py-4 rounded-2xl shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#009b4d] rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-[#009b4d] rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-[#009b4d] rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-100 shadow-[0_-8px_16px_#bebebe,0_2px_4px_#ffffff] px-6 py-6 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={onSubmit} className="flex space-x-4">
            <div className="flex-1 bg-gray-100 rounded-2xl shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff] p-1">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
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
