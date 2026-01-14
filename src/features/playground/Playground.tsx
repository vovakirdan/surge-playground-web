import { useMemo, useRef, useState } from 'react'

import { examples } from '../../data/examples'
import { deriveDiagnostics, mockCompile } from '../../data/mockCompiler'
import MonacoEditor from '../../editor/MonacoEditor'
import type { MonacoEditorHandle } from '../../editor/MonacoEditor'
import type { PlaygroundAction } from '../../types'
import ResultsPanel from './ResultsPanel'

const actions: PlaygroundAction[] = [
  'Diagnostics',
  'Run',
  'HIR',
  'MIR',
  'Compiler Trace',
  'VM Trace',
]

const getExampleById = (id: string) => examples.find((example) => example.id === id)

const defaultExample = getExampleById('diagnostics-overview') ?? examples[0]

const Playground = () => {
  const [action, setAction] = useState<PlaygroundAction>('Diagnostics')
  const [baseCode, setBaseCode] = useState(defaultExample.code)
  const [code, setCode] = useState(defaultExample.code)
  const [selectedExampleId, setSelectedExampleId] = useState(defaultExample.id)
  const [results, setResults] = useState(() => mockCompile(defaultExample.code))
  const editorRef = useRef<MonacoEditorHandle | null>(null)

  const diagnostics = useMemo(() => deriveDiagnostics(code), [code])

  const handleExecute = () => {
    setResults(mockCompile(code))
  }

  const handleReset = () => {
    setCode(baseCode)
    setResults(mockCompile(baseCode))
  }

  const handleExampleChange = (nextId: string) => {
    const example = getExampleById(nextId)
    if (!example) {
      return
    }

    setSelectedExampleId(example.id)
    setBaseCode(example.code)
    setCode(example.code)
    setResults(mockCompile(example.code))
  }

  return (
    <section className="playground">
      <div className="playground-toolbar">
        <div className="toolbar-actions">
          <div className="segmented">
            {actions.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`segment ${tab === action ? 'active' : ''}`}
                onClick={() => setAction(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="toolbar-controls">
          <div className="toolbar-select">
            <label htmlFor="example-select">Load Example</label>
            <select
              id="example-select"
              value={selectedExampleId}
              onChange={(event) => handleExampleChange(event.target.value)}
            >
              {['Basics', 'Diagnostics', 'Option / Erring', 'Async'].map((category) => (
                <optgroup key={category} label={category}>
                  {examples
                    .filter((example) => example.category === category)
                    .map((example) => (
                      <option key={example.id} value={example.id}>
                        {example.title}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleExecute}>
            Execute
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            Reset
          </button>
          <div className="toolbar-indicator">
            Backend = <span>VM</span>
          </div>
        </div>
      </div>
      <div className="playground-body">
        <div className="editor-pane">
          <div className="editor-header">
            <span className="file-chip">main.sg</span>
            <span className="editor-meta">
              Live diagnostics: {diagnostics.length}
            </span>
          </div>
          <div className="editor-surface">
            <MonacoEditor
              ref={editorRef}
              value={code}
              onChange={setCode}
              diagnostics={diagnostics}
              fileName="main.sg"
            />
          </div>
        </div>
        <div className="results-pane">
          <ResultsPanel
            action={action}
            diagnostics={diagnostics}
            results={results}
            onDiagnosticSelect={(diagnostic) =>
              editorRef.current?.focusRange(diagnostic.range)
            }
          />
        </div>
      </div>
    </section>
  )
}

export default Playground
