"use client"

import { useState, useEffect } from "react"

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [activeProject, setActiveProject] = useState<any>(null)
  const [newProjectName, setNewProjectName] = useState("")
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [view, setView] = useState("dashboard") // dashboard, project

  // Load projects on mount
  useEffect(() => {
    loadProjects()
    loadTasks()
  }, [])

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/projects")
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (e) {
      console.error("Failed to load projects")
    }
  }

  const loadTasks = async () => {
    try {
      const res = await fetch("/api/tasks")
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (e) {
      console.error("Failed to load tasks")
    }
  }

  const createProject = async () => {
    if (!newProjectName.trim()) return
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName }),
      })
      if (res.ok) {
        setNewProjectName("")
        loadProjects()
      }
    } catch (e) {
      alert("Failed to create project")
    }
  }

  const createTask = async () => {
    if (!newTaskTitle.trim() || !activeProject) return
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: newTaskTitle, 
          project: activeProject.id,
          status: "todo"
        }),
      })
      if (res.ok) {
        setNewTaskTitle("")
        loadTasks()
      }
    } catch (e) {
      alert("Failed to create task")
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeProject) return
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: newMessage, 
          project: activeProject.id 
        }),
      })
      if (res.ok) {
        setNewMessage("")
        loadMessages(activeProject.id)
      }
    } catch (e) {
      alert("Failed to send message")
    }
  }

  const loadMessages = async (projectId: string) => {
    try {
      const res = await fetch(`/api/messages?project=${projectId}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (e) {
      console.error("Failed to load messages")
    }
  }

  const openProject = (project: any) => {
    setActiveProject(project)
    setView("project")
    loadMessages(project.id)
  }

  const projectTasks = tasks.filter(t => t.project?.id === activeProject?.id)
  const activeTasks = tasks.filter(t => t.status === "in_progress").length
  const completedTasks = tasks.filter(t => t.status === "done").length

  if (view === "project" && activeProject) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "white", fontFamily: "system-ui" }}>
        {/* Header */}
        <header style={{ borderBottom: "1px solid #333", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button onClick={() => setView("dashboard")} style={{ background: "transparent", border: "1px solid #444", color: "white", padding: "0.5rem 1rem", borderRadius: 6, cursor: "pointer" }}>
              ← Back
            </button>
            <h1 style={{ margin: 0 }}>{activeProject.name}</h1>
          </div>
          <span style={{ color: "#888" }}>{activeProject.customerName || "No customer"}</span>
        </header>

        <main style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem" }}>
          {/* Tasks Column */}
          <div>
            <h2 style={{ borderBottom: "2px solid #a3e635", paddingBottom: "0.5rem", marginBottom: "1rem" }}>📋 Tasks</h2>
            
            <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="New task..."
                style={{ flex: 1, padding: "0.75rem", background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, color: "white" }}
              />
              <button onClick={createTask} style={{ padding: "0.75rem 1rem", background: "#a3e635", color: "#0a0a0a", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>
                +
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {projectTasks.map((task: any) => (
                <div key={task.id} style={{ padding: "1rem", background: "#1a1a1a", borderRadius: 8, borderLeft: `4px solid ${
                  task.status === "done" ? "#22c55e" : 
                  task.status === "in_progress" ? "#3b82f6" : 
                  task.status === "review" ? "#f59e0b" : "#6b7280"
                }` }}>
                  <div style={{ fontWeight: 500 }}>{task.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>
                    {task.status} • {task.priority}
                  </div>
                </div>
              ))}
              {projectTasks.length === 0 && (
                <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                  No tasks yet. Create one above!
                </div>
              )}
            </div>
          </div>

          {/* Files Column */}
          <div>
            <h2 style={{ borderBottom: "2px solid #3b82f6", paddingBottom: "0.5rem", marginBottom: "1rem" }}>📁 Files</h2>
            
            <div style={{ border: "2px dashed #333", borderRadius: 8, padding: "2rem", textAlign: "center", marginBottom: "1rem" }}>
              <p style={{ color: "#666", marginBottom: "1rem" }}>Drop files here or click to upload</p>
              <button style={{ padding: "0.5rem 1rem", background: "#1a1a1a", border: "1px solid #444", color: "white", borderRadius: 6, cursor: "pointer" }}>
                Select Files
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ padding: "0.75rem", background: "#1a1a1a", borderRadius: 6, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>📄</span>
                <span style={{ flex: 1 }}>project-brief.pdf</span>
                <span style={{ fontSize: "0.75rem", color: "#666" }}>2.4 MB</span>
              </div>
              <div style={{ padding: "0.75rem", background: "#1a1a1a", borderRadius: 6, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>🖼️</span>
                <span style={{ flex: 1 }}>mockup-v1.png</span>
                <span style={{ fontSize: "0.75rem", color: "#666" }}>1.8 MB</span>
              </div>
            </div>
          </div>

          {/* Chat Column */}
          <div>
            <h2 style={{ borderBottom: "2px solid #f59e0b", paddingBottom: "0.5rem", marginBottom: "1rem" }}>💬 Team Chat</h2>
            
            <div style={{ height: 400, overflowY: "auto", background: "#1a1a1a", borderRadius: 8, padding: "1rem", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {messages.map((msg: any) => (
                <div key={msg.id} style={{ padding: "0.75rem", background: "#252525", borderRadius: 8 }}>
                  <div style={{ fontSize: "0.75rem", color: "#a3e635", marginBottom: "0.25rem" }}>
                    {msg.user?.name || "Unknown"}
                  </div>
                  <div>{msg.content}</div>
                </div>
              ))}
              {messages.length === 0 && (
                <div style={{ textAlign: "center", color: "#666", padding: "2rem 0" }}>
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                style={{ flex: 1, padding: "0.75rem", background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, color: "white" }}
              />
              <button onClick={sendMessage} style={{ padding: "0.75rem 1rem", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
                Send
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Dashboard View
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "white", fontFamily: "system-ui" }}>
      <header style={{ borderBottom: "1px solid #333", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 32, height: 32, background: "#a3e635", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#0a0a0a", fontWeight: "bold" }}>⚡</span>
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Mission Control Hub</span>
        </div>
      </header>

      <main style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12, border: "1px solid #222" }}>
            <div style={{ color: "#888", fontSize: "0.875rem" }}>Active Projects</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#a3e635" }}>{projects.length}</div>
          </div>
          <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12, border: "1px solid #222" }}>
            <div style={{ color: "#888", fontSize: "0.875rem" }}>Active Tasks</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}>{activeTasks}</div>
          </div>
          <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12, border: "1px solid #222" }}>
            <div style={{ color: "#888", fontSize: "0.875rem" }}>Completed</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#22c55e" }}>{completedTasks}</div>
          </div>
          <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12, border: "1px solid #222" }}>
            <div style={{ color: "#888", fontSize: "0.875rem" }}>Total Tasks</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{tasks.length}</div>
          </div>
        </div>

        {/* Create Project */}
        <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12, border: "1px solid #222", marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>➕ Create New Project</h2>
          <div style={{ display: "flex", gap: "1rem" }}>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name..."
              style={{ flex: 1, padding: "1rem", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "white", fontSize: "1rem" }}
            />
            <button 
              onClick={createProject}
              style={{ padding: "1rem 2rem", background: "#a3e635", color: "#0a0a0a", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: "1rem" }}
            >
              Create Project
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <h2 style={{ marginBottom: "1rem" }}>📁 Your Projects</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {projects.map((project: any) => (
            <div 
              key={project.id} 
              onClick={() => openProject(project)}
              style={{ 
                background: "#111", 
                padding: "1.5rem", 
                borderRadius: 12, 
                border: "1px solid #333",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#a3e635"
                e.currentTarget.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#333"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem" }}>{project.name}</h3>
                <span style={{ 
                  padding: "0.25rem 0.5rem", 
                  borderRadius: 4, 
                  fontSize: "0.75rem",
                  background: project.status === "active" ? "#22c55e20" : "#6b728020",
                  color: project.status === "active" ? "#22c55e" : "#9ca3af"
                }}>
                  {project.status}
                </span>
              </div>
              <p style={{ color: "#888", margin: "0.5rem 0", fontSize: "0.875rem" }}>
                {project.description || "No description"}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", fontSize: "0.75rem", color: "#666" }}>
                <span>Customer: {project.customerName || "None"}</span>
                <span>→ Open</span>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div style={{ gridColumn: "1 / -1", padding: "3rem", textAlign: "center", color: "#666", background: "#111", borderRadius: 12, border: "2px dashed #333" }}>
              <p style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>No projects yet</p>
              <p>Create your first project above to get started!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
