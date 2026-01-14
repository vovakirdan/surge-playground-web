import { useMemo, useRef, useState } from 'react'

import { lessons } from '../../data/lessons'
import { deriveDiagnostics, mockCompile } from '../../data/mockCompiler'
import MonacoEditor from '../../editor/MonacoEditor'
import type { MonacoEditorHandle } from '../../editor/MonacoEditor'
import type { Diagnostic, LessonStep, PlaygroundAction } from '../../types'
import ResultsPanel from '../playground/ResultsPanel'

const isStepComplete = (step: LessonStep, diagnostics: Diagnostic[]) => {
  return step.expectations.every((expectation) => {
    const present = diagnostics.some((diag) => diag.code === expectation.code)
    return expectation.presence === 'present' ? present : !present
  })
}

const LessonMode = () => {
  const lesson = lessons[0]
  const [code, setCode] = useState(lesson.initialCode)
  const diagnostics = useMemo(() => deriveDiagnostics(code), [code])
  const results = useMemo(() => mockCompile(code), [code])
  const editorRef = useRef<MonacoEditorHandle | null>(null)

  const completion = lesson.steps.map((step) => isStepComplete(step, diagnostics))
  const activeIndex = completion.findIndex((done) => !done)
  const currentIndex = activeIndex === -1 ? lesson.steps.length - 1 : activeIndex
  const activeStep = lesson.steps[currentIndex]

  return (
    <section className="lesson-mode">
      <div className="lesson-panel">
        <div className="lesson-header">
          <div>
            <p className="lesson-eyebrow">Lesson Mode</p>
            <h2>{lesson.title}</h2>
            <p className="lesson-summary">{lesson.summary}</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setCode(lesson.initialCode)}
          >
            Reset Lesson
          </button>
        </div>

        <div className="lesson-steps">
          {lesson.steps.map((step, index) => {
            const done = completion[index]
            const status = index === currentIndex ? 'active' : done ? 'done' : 'locked'

            return (
              <div key={step.id} className={`lesson-step ${status}`}>
                <div className="lesson-step-title">
                  <span className="lesson-step-index">{index + 1}</span>
                  <span>{step.title}</span>
                </div>
                <p className="lesson-step-body">{step.body}</p>
              </div>
            )
          })}
        </div>

        <div className="lesson-live">
          <div className="lesson-live-title">Current Step</div>
          <div className="lesson-live-body">
            <strong>{activeStep.title}</strong>
            <p>{activeStep.body}</p>
          </div>
        </div>
      </div>

      <div className="lesson-playground">
        <div className="editor-pane">
          <div className="editor-header">
            <span className="file-chip">main.sg</span>
            <span className="editor-meta">Lesson diagnostics: {diagnostics.length}</span>
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
            action={'Diagnostics' as PlaygroundAction}
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

export default LessonMode
