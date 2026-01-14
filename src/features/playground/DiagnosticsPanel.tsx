import type { Diagnostic } from '../../types'

type DiagnosticsPanelProps = {
  diagnostics: Diagnostic[]
  onSelect: (diagnostic: Diagnostic) => void
}

const severityLabel: Record<Diagnostic['severity'], string> = {
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
}

const DiagnosticsPanel = ({ diagnostics, onSelect }: DiagnosticsPanelProps) => {
  if (diagnostics.length === 0) {
    return (
      <div className="panel-empty">
        <p className="panel-empty-title">No diagnostics</p>
        <p className="panel-empty-body">Live analysis shows a clean pass.</p>
      </div>
    )
  }

  return (
    <div className="diagnostics-list">
      {diagnostics.map((diag) => (
        <button
          key={diag.id}
          className={`diag-item diag-${diag.severity}`}
          onClick={() => onSelect(diag)}
          type="button"
        >
          <div className="diag-header">
            <span className={`diag-severity diag-${diag.severity}`}>
              {severityLabel[diag.severity]}
            </span>
            <span className="diag-code">
              {diag.code}
              {diag.codeNumber ? ` (${diag.codeNumber})` : ''}
            </span>
          </div>
          <div className="diag-message">{diag.message}</div>
          <div className="diag-location">
            {diag.file}:{diag.range.startLine}:{diag.range.startCol}
          </div>
          {diag.notes?.length ? (
            <div className="diag-notes">
              {diag.notes.map((note, index) => (
                <div key={`${diag.id}-note-${index}`} className="diag-note">
                  {note.message}
                </div>
              ))}
            </div>
          ) : null}
          {diag.hint ? <div className="diag-hint">Hint: {diag.hint}</div> : null}
        </button>
      ))}
    </div>
  )
}

export default DiagnosticsPanel
