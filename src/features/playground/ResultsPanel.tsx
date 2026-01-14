import type { CompilationResult, Diagnostic, PlaygroundAction } from '../../types'
import DiagnosticsPanel from './DiagnosticsPanel'

type ResultsPanelProps = {
  action: PlaygroundAction
  diagnostics: Diagnostic[]
  results: CompilationResult
  onDiagnosticSelect: (diagnostic: Diagnostic) => void
}

const TextPanel = ({ title, content }: { title: string; content: string }) => {
  return (
    <div className="text-panel">
      <div className="text-panel-title">{title}</div>
      <pre className="text-panel-body">{content || 'No output yet.'}</pre>
    </div>
  )
}

const RunPanel = ({ stdout, stderr }: { stdout: string; stderr: string }) => {
  return (
    <div className="run-panel">
      <div className="run-stream">
        <div className="run-stream-title">stdout</div>
        <pre className="run-stream-body">{stdout || 'No stdout emitted.'}</pre>
      </div>
      <div className="run-stream">
        <div className="run-stream-title">stderr</div>
        <pre className="run-stream-body run-stream-error">
          {stderr || 'No stderr emitted.'}
        </pre>
      </div>
    </div>
  )
}

const ResultsPanel = ({ action, diagnostics, results, onDiagnosticSelect }: ResultsPanelProps) => {
  switch (action) {
    case 'Diagnostics':
      return (
        <DiagnosticsPanel
          diagnostics={diagnostics}
          onSelect={onDiagnosticSelect}
        />
      )
    case 'Run':
      return <RunPanel stdout={results.stdout} stderr={results.stderr} />
    case 'HIR':
      return <TextPanel title="HIR Dump" content={results.hir} />
    case 'MIR':
      return <TextPanel title="MIR Dump" content={results.mir} />
    case 'Compiler Trace':
      return <TextPanel title="Compiler Trace" content={results.compilerTrace} />
    case 'VM Trace':
      return <TextPanel title="VM Trace" content={results.vmTrace} />
    default:
      return null
  }
}

export default ResultsPanel
