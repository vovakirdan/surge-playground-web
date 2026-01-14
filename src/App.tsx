import { useState } from 'react'

import Playground from './features/playground/Playground'
import LessonMode from './features/lessons/LessonMode'

const App = () => {
  const [view, setView] = useState<'playground' | 'lesson'>('playground')

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <div className="app-title">Surge Playground</div>
          <div className="app-subtitle">Transparency-first diagnostics and compiler insight</div>
        </div>
        <nav className="app-nav">
          <button
            type="button"
            className={`nav-button ${view === 'playground' ? 'active' : ''}`}
            onClick={() => setView('playground')}
          >
            Playground
          </button>
          <button
            type="button"
            className={`nav-button ${view === 'lesson' ? 'active' : ''}`}
            onClick={() => setView('lesson')}
          >
            Lesson Mode
          </button>
        </nav>
      </header>
      <main className="app-main">
        {view === 'playground' ? <Playground /> : <LessonMode />}
      </main>
    </div>
  )
}

export default App
