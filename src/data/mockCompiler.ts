import type { CompilationResult, Diagnostic, DiagnosticNote, Severity } from '../types'

const FILE_NAME = 'main.sg'

type DiagnosticRule = {
  id: string
  code: string
  codeNumber: number
  message: string
  severity: Severity
  match: RegExp
  notes?: DiagnosticNote[]
  hint?: string
  condition?: (code: string) => boolean
}

const diagnosticRules: DiagnosticRule[] = [
  {
    id: 'unresolved-greet',
    code: 'SemaUnresolvedSymbol',
    codeNumber: 3005,
    message: 'Unresolved symbol `greet`.',
    severity: 'error',
    match: /\bgreet\s*\(/,
    notes: [
      {
        message: 'No function or value named `greet` is visible in this scope.',
      },
    ],
    hint: 'Import the module that defines `greet`, or declare it in this file.',
  },
  {
    id: 'type-mismatch-string-int',
    code: 'SemaTypeMismatch',
    codeNumber: 3015,
    message: 'Type mismatch: expected `string`, found `int` literal.',
    severity: 'error',
    match: /let\s+\w+\s*:\s*string\s*=\s*42\b/,
    notes: [
      {
        message: 'The variable is declared as `string` but the initializer is an integer literal.',
      },
    ],
    hint: 'Convert the value using `to string`, or change the declared type.',
  },
  {
    id: 'borrow-mutation',
    code: 'SemaBorrowMutation',
    codeNumber: 3019,
    message: 'Cannot take a mutable borrow while a shared borrow is active.',
    severity: 'error',
    match: /&mut\s+data\b/,
    condition: (code) => !code.includes('@drop view'),
    notes: [
      {
        message: '`view` holds a shared borrow of `data` in this scope.',
      },
    ],
    hint: 'Insert `@drop view;` before the mutable borrow to end the shared borrow early.',
  },
]

const indexToLineCol = (text: string, index: number) => {
  const lines = text.slice(0, index).split('\n')
  const line = lines.length
  const col = lines[lines.length - 1].length + 1
  return { line, col }
}

const rangeFromMatch = (text: string, match: RegExpExecArray) => {
  const startIndex = match.index ?? 0
  const length = match[0]?.length ?? 1
  const start = indexToLineCol(text, startIndex)
  const end = indexToLineCol(text, startIndex + Math.max(length, 1))

  return {
    startLine: start.line,
    startCol: start.col,
    endLine: end.line,
    endCol: end.col,
  }
}

export const deriveDiagnostics = (code: string): Diagnostic[] => {
  const diagnostics: Diagnostic[] = []

  for (const rule of diagnosticRules) {
    if (rule.condition && !rule.condition(code)) {
      continue
    }

    const match = rule.match.exec(code)
    rule.match.lastIndex = 0

    if (!match) {
      continue
    }

    diagnostics.push({
      id: rule.id,
      code: rule.code,
      codeNumber: rule.codeNumber,
      message: rule.message,
      severity: rule.severity,
      file: FILE_NAME,
      range: rangeFromMatch(code, match),
      notes: rule.notes,
      hint: rule.hint,
    })
  }

  return diagnostics
}

const mockHir = `HIR Dump (mock)
module main
  fn main() -> unit
    block0:
      let message: string
      let value: int
      return
`

const mockMir = `MIR Dump (mock)
fn main() -> unit
  bb0:
    _0 = const unit
    return
`

const mockTrace = (diagCount: number) => `TRACE (mock, text format)
[seq      1] -> diagnose
[seq      2]   -> tokenize
[seq      3]   <- tokenize (diags=0)
[seq      4]   -> parse
[seq      5]   <- parse (items=1)
[seq      6]   -> sema
[seq      7]   <- sema (diags=${diagCount})
[seq      8] <- diagnose
`

const mockVmTrace = `VM TRACE (mock)
enter __surge_start
call main
return unit
exit 0
`

export const mockCompile = (code: string): CompilationResult => {
  const diagnostics = deriveDiagnostics(code)
  const hasErrors = diagnostics.some((diag) => diag.severity === 'error')

  return {
    diagnostics,
    stdout: hasErrors ? '' : 'Program executed successfully. (mock)\n',
    stderr: hasErrors ? 'Compilation halted due to diagnostics. (mock)\n' : '',
    hir: mockHir,
    mir: mockMir,
    compilerTrace: mockTrace(diagnostics.length),
    vmTrace: hasErrors ? '' : mockVmTrace,
  }
}
