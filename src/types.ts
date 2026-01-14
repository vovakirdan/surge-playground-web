export type Severity = 'error' | 'warning' | 'info'

export type DiagnosticRange = {
  startLine: number
  startCol: number
  endLine: number
  endCol: number
}

export type DiagnosticNote = {
  message: string
  range?: DiagnosticRange
}

export type Diagnostic = {
  id: string
  code: string
  codeNumber?: number
  message: string
  severity: Severity
  file: string
  range: DiagnosticRange
  notes?: DiagnosticNote[]
  hint?: string
}

export type CompilationResult = {
  diagnostics: Diagnostic[]
  stdout: string
  stderr: string
  hir: string
  mir: string
  compilerTrace: string
  vmTrace: string
}

export type ExampleCategory = 'Basics' | 'Diagnostics' | 'Option / Erring' | 'Async'

export type Example = {
  id: string
  title: string
  category: ExampleCategory
  description: string
  code: string
}

export type DiagnosticExpectation = {
  code: string
  presence: 'present' | 'absent'
}

export type LessonStep = {
  id: string
  title: string
  body: string
  expectations: DiagnosticExpectation[]
}

export type Lesson = {
  id: string
  title: string
  summary: string
  initialCode: string
  steps: LessonStep[]
}

export type PlaygroundAction =
  | 'Diagnostics'
  | 'Run'
  | 'HIR'
  | 'MIR'
  | 'Compiler Trace'
  | 'VM Trace'
