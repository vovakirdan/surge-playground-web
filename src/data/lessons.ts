import type { Lesson } from '../types'

export const lessons: Lesson[] = [
  {
    id: 'borrow-drop',
    title: 'Borrow Lifetimes and @drop',
    summary: 'Understand why a shared borrow blocks a mutable borrow, and how @drop releases it early.',
    initialCode: `@entrypoint
fn main() {
    let data: string = "Surge";
    let view: &string = &data;
    // TODO: release view before taking &mut data
    let edit: &mut string = &mut data;
    print(view);
}
`,
    steps: [
      {
        id: 'observe-borrow-mutation',
        title: 'Observe the borrow conflict',
        body: 'The compiler refuses to create a mutable borrow while a shared borrow is still alive. This shows up as a borrow-mutation diagnostic.',
        expectations: [{ code: 'SemaBorrowMutation', presence: 'present' }],
      },
      {
        id: 'release-borrow',
        title: 'Release the borrow explicitly',
        body: 'Insert `@drop view;` before the mutable borrow so the shared borrow ends early. The diagnostic should disappear.',
        expectations: [{ code: 'SemaBorrowMutation', presence: 'absent' }],
      },
    ],
  },
]
