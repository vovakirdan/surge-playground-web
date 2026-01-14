import type { Example } from '../types'

export const examples: Example[] = [
  {
    id: 'hello-world',
    title: 'Hello, Surge',
    category: 'Basics',
    description: 'Minimal entrypoint with a single print call.',
    code: `@entrypoint
fn main() {
    print("Hello from Surge.");
}
`,
  },
  {
    id: 'diagnostics-overview',
    title: 'Diagnostics Snapshot',
    category: 'Diagnostics',
    description: 'Intentional mismatches to surface structured diagnostics.',
    code: `@entrypoint
fn main() {
    let message: string = 42;
    let value: int = greet(message);
    print(message);
}
`,
  },
  {
    id: 'option-branching',
    title: 'Option Branching',
    category: 'Option / Erring',
    description: 'Pattern matching with Option values.',
    code: `import option;

@entrypoint
fn main() {
    let value: Option<int> = Some(21);
    let doubled: int = compare value {
        Some(v) => v + v,
        _ => 0,
    };
    print("Option handled.");
}
`,
  },
  {
    id: 'async-spawn',
    title: 'Spawn and Await',
    category: 'Async',
    description: 'Structured concurrency with explicit awaits.',
    code: `async fn compute() -> int {
    return 7;
}

@entrypoint
fn main() {
    let task: Task<int> = spawn compute();
    let value: int = task.await();
    print("Task complete.");
}
`,
  },
]
