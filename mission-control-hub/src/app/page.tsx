export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "white", fontFamily: "system-ui" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #333", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 32, height: 32, background: "#a3e635", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#0a0a0a", fontWeight: "bold" }}>⚡</span>
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Mission Control Hub</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#888" }}>Demo User</span>
          <button style={{ padding: "0.5rem 1rem", border: "1px solid #444", background: "transparent", color: "white", borderRadius: 6, cursor: "pointer" }}>Settings</button>
        </div>
      </header>

      {/* Main */}
      <main style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Welcome back, Demo User!</h1>
        <p style={{ color: "#888", marginBottom: "2rem" }}>Here is what is happening with your missions today.</p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12, border: "1px solid #222" }}>
            <div style={{ color: "#888", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Active Tasks</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>12</div>
            <div style={{ color: "#a3e635", fontSize: "0.75rem" }}>+2 from yesterday</div>
          </div>
          <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12, border: "1px solid #222" }}>
            <div style={{ color: "#888", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Team Members</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>5</div>
            <div style={{ color: "#a3e635", fontSize: "0.75rem" }}>+1 new this week</div>
          </div>
          <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12, border: "1px solid #222" }}>
            <div style={{ color: "#888", fontSize: "0.875rem", marginBottom: "0.5rem" }}>AI Agents</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>3</div>
            <div style={{ color: "#a3e635", fontSize: "0.75rem" }}>All operational</div>
          </div>
          <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12, border: "1px solid #222" }}>
            <div style={{ color: "#888", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Completed</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>89%</div>
            <div style={{ color: "#a3e635", fontSize: "0.75rem" }}>+5% this month</div>
          </div>
        </div>

        {/* Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
          {/* Left */}
          <div style={{ space: "2rem" }}>
            <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12, border: "1px solid #222", marginBottom: "1rem" }}>
              <h2 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>📊</span> Recent Activity
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "#1a1a1a", borderRadius: 8 }}>
                  <div style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%" }}></div>
                  <div>
                    <div style={{ fontWeight: 500 }}>System initialized</div>
                    <div style={{ fontSize: "0.75rem", color: "#666" }}>Just now</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "#1a1a1a", borderRadius: 8 }}>
                  <div style={{ width: 8, height: 8, background: "#3b82f6", borderRadius: "50%" }}></div>
                  <div>
                    <div style={{ fontWeight: 500 }}>Dashboard ready</div>
                    <div style={{ fontSize: "0.75rem", color: "#666" }}>Welcome to Mission Control Hub</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12, border: "1px solid #222" }}>
              <h2 style={{ marginBottom: "1rem" }}>Quick Actions</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <button style={{ padding: "1.5rem", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "white", cursor: "pointer" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⚡</div>
                  <div>New Task</div>
                </button>
                <button style={{ padding: "1.5rem", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "white", cursor: "pointer" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🤖</div>
                  <div>Deploy Agent</div>
                </button>
                <button style={{ padding: "1.5rem", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "white", cursor: "pointer" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>👥</div>
                  <div>Invite Team</div>
                </button>
                <button style={{ padding: "1.5rem", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "white", cursor: "pointer" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📈</div>
                  <div>View Reports</div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div>
            <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12, border: "1px solid #222", marginBottom: "1rem" }}>
              <h2 style={{ marginBottom: "1rem" }}>Your Spaces</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ padding: "1rem", border: "1px solid #333", borderRadius: 8, cursor: "pointer" }}>
                  <div style={{ fontWeight: 500 }}>Personal</div>
                  <div style={{ fontSize: "0.75rem", color: "#666" }}>Your private workspace</div>
                </div>
                <div style={{ padding: "1rem", border: "1px solid #333", borderRadius: 8, cursor: "pointer" }}>
                  <div style={{ fontWeight: 500 }}>Team Alpha</div>
                  <div style={{ fontSize: "0.75rem", color: "#666" }}>5 members</div>
                </div>
              </div>
            </div>

            <div style={{ background: "#111", padding: "1.5rem", borderRadius: 12, border: "1px solid #222" }}>
              <h2 style={{ marginBottom: "1rem" }}>Active Agents</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem" }}>
                  <div style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%" }}></div>
                  <span>Research Assistant</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem" }}>
                  <div style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%" }}></div>
                  <span>Code Reviewer</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem" }}>
                  <div style={{ width: 8, height: 8, background: "#eab308", borderRadius: "50%" }}></div>
                  <span>Data Analyzer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
