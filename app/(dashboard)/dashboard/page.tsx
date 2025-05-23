"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Bot, Github, LogOut, MessageSquarePlus, User } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DashboardPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hello! I'm your AI assistant. How can I help you with your repository today?" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage = { role: "user", content: input }
    setMessages(prev => [...prev, newMessage])
    setInput("")
    setIsLoading(true)

    // TODO: Implement actual AI chat logic
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I understand you'd like help with your repository. Could you please provide more specific details about what you'd like to know?"
      }])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/40">
        <div className="flex h-14 items-center border-b px-4">
          <Bot className="h-6 w-6" />
          <span className="ml-2 font-bold">GitBot</span>
        </div>
        
        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
          <div className="flex-1 overflow-auto p-4">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Dialog>
                <DialogTrigger className="w-full">
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  New Chat
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect Repository</DialogTitle>
                    <DialogDescription>
                      Enter your GitHub repository URL to start a new chat session.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="repo-url">Repository URL</Label>
                      <Input
                        id="repo-url"
                        placeholder="https://github.com/username/repo"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Connect Repository</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Button>
            
            <Separator className="my-4" />
            
            {/* Chat History */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Recent Chats</h2>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  Project Discussion
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  Code Review
                </Button>
              </div>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-6 w-6" />
                <span className="ml-2">John Doe</span>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "assistant"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}