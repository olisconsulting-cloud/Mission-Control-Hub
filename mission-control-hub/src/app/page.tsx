'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [count, setCount] = useState(0)
  
  return (
    <div style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Mission Control Hub</h1>
      <p>Ultra Simple Test</p>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
    </div>
  )
}
