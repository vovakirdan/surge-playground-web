# Surge Playground Web

Production-grade frontend for a Surge language playground focused on live diagnostics and compiler transparency. The backend is mocked by design so the UI can evolve independently of the compiler runtime.

## What’s inside

- Monaco Editor wired to Surge’s TextMate grammar for accurate syntax highlighting.
- Diagnostics-first workflow with structured error metadata and editor decorations.
- Output, HIR, MIR, compiler trace, and VM trace panels (mocked for now).
- Lesson Mode scaffolding that reacts to diagnostics and unlocks steps.
- Examples system grouped by category for rapid swaps.

## Project structure

- `src/editor/monacoSetup.ts`: Monaco + TextMate integration and theme.
- `src/editor/MonacoEditor.tsx`: Editor wrapper with diagnostic decorations.
- `src/data/mockCompiler.ts`: Mock compilation results + live diagnostic derivation.
- `src/features/playground/`: Main playground layout and panels.
- `src/features/lessons/`: Lesson Mode layout and step logic.
- `src/data/examples.ts`: Example presets.

## Development

```bash
npm install
npm run dev
```

## Notes

- No Surge CLI calls or backend execution are wired yet.
- Diagnostics, traces, and IR outputs are mocked but structured to match real data flows.
