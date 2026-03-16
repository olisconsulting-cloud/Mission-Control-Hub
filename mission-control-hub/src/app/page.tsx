"use client"

import { useState, useEffect, useCallback } from "react"

const API_BASE = ""

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [activeProject, setActiveProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Form states
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectCustomer, setNewProjectCustomer] = useState("")
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState("medium")
  const [newMessage, setNewMessage] = useState("")
  const [creatingProject, setCreatingProject] = useState(false)
  const [creatingTask, setCreatingTask] = useState(false)

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/projects`)
      const data = await res.json()
      if (data.projects) {
        setProjects(data.projects)
      }
      setError("")
    } catch (e: any) {
      setError("Failed to load projects: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async (projectId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks?project=${projectId}`)
      const data = await res.json()
      if (data.tasks) {
        setTasks(data.tasks)
      }
    } catch (e: any) {
      console.error("Failed to load tasks:", e.message)
    }
  }

  const loadMessages = async (projectId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/messages?project=${projectId}`)
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (e: any) {
      console.error("Failed to load messages:", e.message)
    }
  }

  const createProject = async () => {
    if (!newProjectName.trim()) return
    setCreatingProject(true)
    
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newProjectName, 
          customerName: newProjectCustomer 
        }),
      })
      
      if (res.ok) {
        setNewProjectName("")
        setNewProjectCustomer("")
        await loadProjects()
      } else {
        const err = await res.json()
        alert("Failed: " + err.error)
      }
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setCreatingProject(false)
    }
  }

  const createTask = async () => {
    if (!newTaskTitle.trim() || !activeProject) return
    setCreatingTask(true)
    
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: newTaskTitle,
          projectId: activeProject.id,
          priority: newTaskPriority,
          status: "todo"
        }),
      })
      
      if (res.ok) {
        setNewTaskTitle("")
        await loadTasks(activeProject.id)
      } else {
        const err = await res.json()
        alert("Failed: " + err.error)
      }
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setCreatingTask(false)
    }
  }

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await fetch(`${API_BASE}/api/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      })
      if (activeProject) {
        await loadTasks(activeProject.id)
      }
    } catch (e) {
      console.error("Failed to update task")
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeProject) return
    
    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: newMessage,
          projectId: activeProject.id
        }),
      })
      
      if (res.ok) {
        setNewMessage("")
        await loadMessages(activeProject.id)
      }
    } catch (e) {
      console.error("Failed to send message")
    }
  }

  const openProject = (project: any) => {
    setActiveProject(project)
    loadTasks(project.id)
    loadMessages(project.id)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      backlog: "#6b7280",
      todo: "#3b82f6",
      in_progress: "#f59e0b",
      review: "#8b5cf6",
      done: "#22c55e"
    }
    return colors[status] || "#6b7280"
  }

  const projectTasks = tasks.filter((t: any) => t.project_id === activeProject?.id)
  const todoTasks = projectTasks.filter((t: any) => t.status === "todo")
  const inProgressTasks = projectTasks.filter((t: any) => t.status === "in_progress")
  const doneTasks = projectTasks.filter((t: any) ==> t.status === "done")

  if (activeProject) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "white", fontFamily: "system-ui" }}>
        <header style={{ borderBottom: "1px solid #333", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button 
              onClick={() => setActiveProject(null)}
              style={{ background: "transparent", border: "1px solid #444", color: "white", padding: "0.5rem 1rem", borderRadius: 6, cursor: "pointer" }}
            >
              ← Back
            </button>
            <h1 style={{ margin: 0 }}>{activeProject.name}</h1>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span style={{ color: "#888", fontSize: "0.875rem" }}>{activeProject.customer_name || "No customer"}</span>
            <span style={{ padding: "0.25rem 0.75rem", background: "#22c55e20", color: "#22c55e", borderRadius: 4, fontSize: "0.75rem" }}>
              {activeProject.status}
            </span>
          </div>
        </header>

        <main style={{ padding: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem" }}>
          {/* Tasks Column */}
          <div>
            <h2 style={{ borderBottom: "2px solid #3b82f6", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              📋 Tasks ({projectTasks.length})
            </h2>
            
            <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="New task..."
                onKeyPress={(e) => e.key === "Enter" && createTask()}
                style={{ padding: "0.75rem", background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, color: "white" }}
              />
              <select 
                value={newTaskPriority} 
                onChange={(e) => setNewTaskPriority(e.target.value)}
                style={{ padding: "0.5rem", background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, color: "white" }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <button 
                onClick={createTask}
                disabled={creatingTask || !newTaskTitle.trim()}
                style={{ 
                  padding: "0.75rem", 
                  background: creatingTask ? "#333" : "#3b82f6", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 6, 
                  cursor: creatingTask ? "not-allowed" : "pointer",
                  opacity: creatingTask ? 0.5 : 1
                }}
              >
                {creatingTask ? "Creating..." : "+ Add Task"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {/* Todo */}
              {todoTasks.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#3b82f6", marginBottom: "0.5rem", fontWeight: "bold" }}>TO DO ({todoTasks.length})</div>
                  {todoTasks.map((task: any) => (
                    <div key={task.id} style={{ padding: "0.75rem", background: "#1a1a1a", borderRadius: 6, borderLeft: "3px solid #3b82f6", marginBottom: "0.5rem" }}>
                      <div style={{ fontWeight: 500 }}>{task.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>{task.priority} • 
                        <select 
                          value={task.status} 
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer" }}
                        >
                          <option value="backlog">Backlog</option>
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* In Progress */}
              {inProgressTasks.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#f59e0b", marginBottom: "0.5rem", fontWeight: "bold" }}>IN PROGRESS ({inProgressTasks.length})</div>
                  {inProgressTasks.map((task: any) => (
                    <div key={task.id} style={{ padding: "0.75rem", background: "#1a1a1a", borderRadius: 6, borderLeft: "3px solid #f59e0b", marginBottom: "0.5rem" }}>
                      <div style={{ fontWeight: 500 }}>{task.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>{task.priority} • 
                        <select 
                          value={task.status} 
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer" }}
                        >
                          <option value="backlog">Backlog</option>
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Done */}
              {doneTasks.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#22c55e", marginBottom: "0.5rem", fontWeight: "bold" }}>DONE ({doneTasks.length})</div>
                  {doneTasks.map((task: any) => (
                    <div key={task.id} style={{ padding: "0.75rem", background: "#1a1a1a", borderRadius: 6, borderLeft: "3px solid #22c55e", marginBottom: "0.5rem", opacity: 0.7 }}>
                      <div style={{ fontWeight: 500, textDecoration: "line-through" }}>{task.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>{task.priority} • 
                        <select 
                          value={task.status} 
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer" }}
                        >
                          <option value="backlog">Backlog</option>
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {projectTasks.length === 0 && (
                <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>No tasks yet</div>
              )}
            </div>
          </div>

          {/* Files Column */}
          <div>
            <h2 style={{ borderBottom: "2px solid #8b5cf6", paddingBottom: "0.5rem", marginBottom: "1rem" }}>📁 Files</h2>
            <div style={{ border: "2px dashed #333", borderRadius: 8, padding: "2rem", textAlign: "center" }}>
              <p style={{ color: "#666" }}>File upload coming soon</p>
            </div>
          </div>

          {/* Chat Column */}
          <div>
            <h2 style={{ borderBottom: "2px solid #22c55e", paddingBottom: "0.5rem", marginBottom: "1rem" }}>💬 Chat</h2>
            
            <div style={{ height: 300, overflowY: "auto", background: "#1a1a1a", borderRadius: 8, padding: "1rem", marginBottom: "1rem" }}>
              {messages.map((msg: any) => (
                <div key={msg.id} style={{ marginBottom: "0.75rem", padding: "0.75rem", background: "#252525", borderRadius: 6 }}>
                  <div style={{ fontSize: "0.75rem", color: "#a3e635", marginBottom: "0.25rem" }}>{msg.user_name || msg.user_email || "User"}</div>
                  <div>{msg.content}</div>
                  <div style={{ fontSize: "0.65rem", color: "#666", marginTop: "0.25rem" }}>{new Date(msg.created_at).toLocaleTimeString()}</div>
                </div>
              ))}
              {messages.length === 0 && (
                <div style={{ textAlign: "center", color: "#666", padding: "2rem" }}>No messages yet</div>
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
              <button onClick={sendMessage} style={{ padding: "0.75rem 1rem", background: "#22c55e", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Send</button>
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
            <span>⚡</span>
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Mission Control Hub</span>
        </div>
      </header>

      <main style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
        {error && (
          <div style={{ background: "#ef444420", border: "1px solid #ef4444", padding: "1rem", borderRadius: 8, marginBottom: "1rem", color: "#ef4444" }}>
            {error}
          </div>
        )}
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12 }}>
            <div style={{ color: "#888", fontSize: "0.875rem" }}>Projects</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#a3e635" }}>{projects.length}</div>
          </div>
          <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12 }}>
            <div style={{ color: "#888", fontSize: "0.875rem" }}>Total Tasks</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}>{tasks.length}</div>
          </div>
        </div>

        <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12, marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>➕ Create New Project</h2>
          <div style={{ display: "flex", gap: "1rem" }}>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              style={{ flex: 1, padding: "1rem", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "white" }}
            />
            <input
              type="text"
              value={newProjectCustomer}
              onChange={(e) => setNewProjectCustomer(e.target.value)}
              placeholder="Customer name (optional)"
              style={{ flex: 1, padding: "1rem", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "white" }}
            />
            <button 
              onClick={createProject}
              disabled={creatingProject || !newProjectName.trim()}
              style={{ 
                padding: "1rem 2rem", 
                background: creatingProject ? "#333" : "#a3e635", 
                color: "#0a0a0a", 
                border: "none", 
                borderRadius: 8, 
                cursor: creatingProject ? "not-allowed" : "pointer",
                fontWeight: "bold",
                opacity: creatingProject ? 0.5 : 1
              }}
            >
              {creatingProject ? "Creating..." : "Create Project"}
            </button>
          </div>
        </div>

        <h2 style={{ marginBottom: "1rem" }}>📁 Projects</h2>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>Loading...⏳</div>
        ) : (
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
                  cursor: "pointer"
                }}
              >
                <h3 style={{ margin: "0 0 0.5rem 0" }}>{project.name}</h3>
                {project.customer_name && (
                  <p style={{ color: "#888", fontSize: "0.875rem", margin: "0.25rem 0" }}>Customer: {project.customer_name}</p>
                )}
                <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ 
                    padding: "0.25rem 0.5rem", 
                    background: "#22c55e20", 
                    color: "#22c55e", 
                    borderRadius: 4,
                    fontSize: "0.75rem"
                  }}>
                    {project.status}
                  </span>
                  <span style={{ color: "#666" }}>→ Open</span>
                </div>
              </div>
            ))}
            {projects.length === 0 && !loading && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "#666" }}>
                No projects yet. Create one above! 👆
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
