'use client'

import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [messages, setMessages] = useState([])
  const [activeProject, setActiveProject] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectCustomer, setNewProjectCustomer] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      setLoading(true)
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (data.projects) setProjects(data.projects)
    } catch (e) {
      console.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  async function loadTasks(projectId) {
    try {
      const res = await fetch(`/api/tasks?project=${projectId}`)
      const data = await res.json()
      if (data.tasks) setTasks(data.tasks)
    } catch (e) {
      console.error('Failed to load tasks')
    }
  }

  async function loadMessages(projectId) {
    try {
      const res = await fetch(`/api/messages?project=${projectId}`)
      const data = await res.json()
      if (data.messages) setMessages(data.messages)
    } catch (e) {
      console.error('Failed to load messages')
    }
  }

  async function createProject() {
    if (!newProjectName.trim()) return
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newProjectName, 
          customerName: newProjectCustomer 
        }),
      })
      if (res.ok) {
        setNewProjectName('')
        setNewProjectCustomer('')
        loadProjects()
      }
    } catch (e) {
      alert('Error creating project')
    }
  }

  async function createTask() {
    if (!newTaskTitle.trim() || !activeProject) return
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newTaskTitle,
          projectId: activeProject.id,
          status: 'todo'
        }),
      })
      if (res.ok) {
        setNewTaskTitle('')
        loadTasks(activeProject.id)
      }
    } catch (e) {
      alert('Error creating task')
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !activeProject) return
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newMessage,
          projectId: activeProject.id
        }),
      })
      if (res.ok) {
        setNewMessage('')
        loadMessages(activeProject.id)
      }
    } catch (e) {
      console.error('Failed to send message')
    }
  }

  function openProject(project) {
    setActiveProject(project)
    loadTasks(project.id)
    loadMessages(project.id)
  }

  const projectTasks = tasks.filter(t => t.project_id === activeProject?.id)

  if (activeProject) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', fontFamily: 'system-ui' }}>
        <header style={{ borderBottom: '1px solid #333', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setActiveProject(null)} style={{ background: 'transparent', border: '1px solid #444', color: 'white', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer' }}>
              ← Back
            </button>
            <h1 style={{ margin: 0 }}>{activeProject.name}</h1>
          </div>
          <span style={{ color: '#888' }}>{activeProject.customer_name || 'No customer'}</span>
        </header>

        <main style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
          {/* Tasks */}
          <div>
            <h2 style={{ borderBottom: '2px solid #3b82f6', paddingBottom: '0.5rem' }}>📋 Tasks ({projectTasks.length})</h2>
            
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="New task..."
                style={{ flex: 1, padding: '0.75rem', background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, color: 'white' }}
              />
              <button onClick={createTask} style={{ padding: '0.75rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                + Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {projectTasks.map((task) => (
                <div key={task.id} style={{ padding: '0.75rem', background: '#1a1a1a', borderRadius: 6, borderLeft: `3px solid ${task.status === 'done' ? '#22c55e' : task.status === 'in_progress' ? '#f59e0b' : '#3b82f6'}` }}>
                  <div style={{ fontWeight: 500 }}>{task.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>{task.status}</div>
                </div>
              ))}
              {projectTasks.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No tasks yet</div>}
            </div>
          </div>

          {/* Files */}
          <div>
            <h2 style={{ borderBottom: '2px solid #8b5cf6', paddingBottom: '0.5rem' }}>📁 Files</h2>
            <div style={{ border: '2px dashed #333', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#666' }}>File upload coming soon</p>
            </div>
          </div>

          {/* Chat */}
          <div>
            <h2 style={{ borderBottom: '2px solid #22c55e', paddingBottom: '0.5rem' }}>💬 Chat</h2>
            
            <div style={{ height: 300, overflowY: 'auto', background: '#1a1a1a', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#252525', borderRadius: 6 }}>
                  <div style={{ fontSize: '0.75rem', color: '#a3e635' }}>{msg.user_name || 'User'}</div>
                  <div>{msg.content}</div>
                </div>
              ))}
              {messages.length === 0 && <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No messages yet</div>}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '0.75rem', background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, color: 'white' }}
              />
              <button onClick={sendMessage} style={{ padding: '0.75rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Send</button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Dashboard
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', fontFamily: 'system-ui' }}>
      <header style={{ borderBottom: '1px solid #333', padding: '1rem 2rem' }}>
        <h1 style={{ margin: 0 }}>⚡ Mission Control Hub</h1>
      </header>

      <main style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: 12, marginBottom: '2rem' }}>
          <h2>Create New Project</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              style={{ flex: 1, padding: '1rem', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: 'white' }}
            />
            <input
              type="text"
              value={newProjectCustomer}
              onChange={(e) => setNewProjectCustomer(e.target.value)}
              placeholder="Customer (optional)"
              style={{ flex: 1, padding: '1rem', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: 'white' }}
            />
            <button onClick={createProject} style={{ padding: '1rem 2rem', background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
              Create
            </button>
          </div>
        </div>

        <h2>Projects ({projects.length})</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {projects.map((project) => (
              <div 
                key={project.id}
                onClick={() => openProject(project)}
                style={{ background: '#111', padding: '1.5rem', borderRadius: 12, border: '1px solid #333', cursor: 'pointer' }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{project.name}</h3>
                {project.customer_name && <p style={{ color: '#888', fontSize: '0.875rem' }}>Customer: {project.customer_name}</p>}
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ padding: '0.25rem 0.5rem', background: '#22c55e20', color: '#22c55e', borderRadius: 4, fontSize: '0.75rem' }}>{project.status}</span>
                  <span style={{ color: '#666' }}>→ Open</span>
                </div>
              </div>
            ))}
            {projects.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#666' }}>No projects yet. Create one above!</div>}
          </div>
        )}
      </main>
    </div>
  )
}
