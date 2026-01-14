import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import * as monaco from 'monaco-editor'

import type { Diagnostic, DiagnosticRange } from '../types'
import { setupSurgeMonaco } from './monacoSetup'

type MonacoEditorProps = {
  value: string
  onChange: (value: string) => void
  diagnostics: Diagnostic[]
  fileName: string
}

export type MonacoEditorHandle = {
  focusRange: (range: DiagnosticRange) => void
}

const severityToRulerColor: Record<Diagnostic['severity'], string> = {
  error: '#C0392B',
  warning: '#B65D0C',
  info: '#0E7490',
}

const MonacoEditor = forwardRef<MonacoEditorHandle, MonacoEditorProps>(
  ({ value, onChange, diagnostics }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const modelRef = useRef<monaco.editor.ITextModel | null>(null)
    const decorationsRef = useRef<string[]>([])
    const skipChangeRef = useRef(false)

    useImperativeHandle(ref, () => ({
      focusRange: (range) => {
        if (!editorRef.current) {
          return
        }

        const targetRange = new monaco.Range(
          range.startLine,
          range.startCol,
          range.endLine,
          range.endCol
        )
        editorRef.current.setSelection(targetRange)
        editorRef.current.revealRangeInCenter(targetRange)
        editorRef.current.focus()
      },
    }))

    useEffect(() => {
      if (!containerRef.current || editorRef.current) {
        return
      }

      let isMounted = true

      const model = monaco.editor.createModel(value, 'surge')
      modelRef.current = model

      const editor = monaco.editor.create(containerRef.current, {
        model,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        fontFamily:
          '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
        fontSize: 13,
        lineHeight: 20,
        lineNumbersMinChars: 4,
        padding: { top: 18, bottom: 18 },
        renderWhitespace: 'boundary',
        tabSize: 4,
      })

      editorRef.current = editor

      const contentSubscription = editor.onDidChangeModelContent(() => {
        if (skipChangeRef.current) {
          return
        }
        onChange(editor.getValue())
      })

      setupSurgeMonaco(monaco, editor).catch(() => {
        if (isMounted) {
          // Monaco can be disposed during strict mode remounts; ignore in dev.
        }
      })

      return () => {
        isMounted = false
        contentSubscription.dispose()
        editor.dispose()
        model.dispose()
        editorRef.current = null
        modelRef.current = null
        decorationsRef.current = []
      }
    }, [onChange])

    useEffect(() => {
      if (!editorRef.current) {
        return
      }

      const editor = editorRef.current
      const nextDecorations = diagnostics.map((diagnostic) => ({
        range: new monaco.Range(
          diagnostic.range.startLine,
          diagnostic.range.startCol,
          diagnostic.range.endLine,
          diagnostic.range.endCol
        ),
        options: {
          inlineClassName: `diag-inline diag-${diagnostic.severity}`,
          className: `diag-line diag-${diagnostic.severity}`,
          overviewRuler: {
            color: severityToRulerColor[diagnostic.severity],
            position: monaco.editor.OverviewRulerLane.Right,
          },
        },
      }))

      decorationsRef.current = editor.deltaDecorations(
        decorationsRef.current,
        nextDecorations
      )
    }, [diagnostics])

    useEffect(() => {
      if (!modelRef.current) {
        return
      }

      const model = modelRef.current
      if (model.isDisposed()) {
        return
      }
      if (value !== model.getValue()) {
        skipChangeRef.current = true
        model.setValue(value)
        skipChangeRef.current = false
      }
    }, [value])

    return <div className="monaco-host" ref={containerRef} />
  }
)

MonacoEditor.displayName = 'MonacoEditor'

export default MonacoEditor
