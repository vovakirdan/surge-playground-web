import type * as Monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'
import { loadWASM } from 'onigasm'

import surgeGrammar from '../assets/surge.tmLanguage.json?raw'
import languageConfiguration from '../assets/surge-language-configuration.json'
import onigasmWasm from 'onigasm/lib/onigasm.wasm?url'

type MonacoEnvironment = {
  MonacoEnvironment?: {
    getWorker: (moduleId: string, label: string) => Worker
  }
}

const monacoGlobal = self as unknown as MonacoEnvironment

if (!monacoGlobal.MonacoEnvironment) {
  monacoGlobal.MonacoEnvironment = {
    getWorker: () => new EditorWorker(),
  }
}

const languageId = 'surge'
const scopeName = 'source.surge'

let setupPromise: Promise<void> | null = null

const defineSurgeTheme = (monaco: typeof Monaco) => {
  monaco.editor.defineTheme('surge-paper', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6B6A67', fontStyle: 'italic' },
      { token: 'keyword', foreground: '0F4C5C', fontStyle: 'bold' },
      { token: 'number', foreground: '8F2D56' },
      { token: 'string', foreground: '2D6A4F' },
      { token: 'type', foreground: '6B4E71' },
      { token: 'function', foreground: '355070' },
    ],
    colors: {
      'editor.background': '#FBF4E9',
      'editor.lineHighlightBackground': '#F4E8D7',
      'editorLineNumber.foreground': '#8C8173',
      'editorCursor.foreground': '#1C1B1A',
      'editor.selectionBackground': '#D9C9B1',
      'editor.inactiveSelectionBackground': '#E8DCC7',
      'editorBracketMatch.background': '#D9C9B1',
      'editorBracketMatch.border': '#B49A7A',
    },
  })
}

export const setupSurgeMonaco = async (
  monaco: typeof Monaco,
  editor: Monaco.editor.IStandaloneCodeEditor
) => {
  if (!setupPromise) {
    setupPromise = (async () => {
      if (!monaco.languages.getLanguages().some((lang) => lang.id === languageId)) {
        monaco.languages.register({
          id: languageId,
          extensions: ['.sg'],
          aliases: ['Surge', 'surge'],
        })
      }

      monaco.languages.setLanguageConfiguration(
        languageId,
        languageConfiguration as unknown as Monaco.languages.LanguageConfiguration
      )

      defineSurgeTheme(monaco)

      await loadWASM(onigasmWasm)
    })()
  }

  await setupPromise

  const registry = new Registry({
    getGrammarDefinition: async (requestedScope) => {
      if (requestedScope !== scopeName) {
        return {
          format: 'json',
          content: surgeGrammar,
        }
      }

      return {
        format: 'json',
        content: surgeGrammar,
      }
    },
  })

  const grammars = new Map([[languageId, scopeName]])
  await wireTmGrammars(monaco, registry, grammars, editor)
  monaco.editor.setTheme('surge-paper')
}
