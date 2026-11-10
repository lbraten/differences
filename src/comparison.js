import { diffArrays, diffChars } from "diff";

const linesOf = (text) =>
  text === "" ? [] : text.replace(/\r\n?/g, "\n").split("\n");
const lengthOf = (text) => Array.from(text).length;

export function compareTexts(original, modified) {
  const before = linesOf(original);
  const after = linesOf(modified);
  const chunks = diffArrays(before, after, { timeout: 1500 }) || [
    { removed: true, value: before },
    { added: true, value: after },
  ];
  const rows = [];
  const counts = {
    lines: { added: 0, removed: 0, changed: 0 },
    characters: { added: 0, removed: 0, changed: 0 },
  };
  let oldNumber = 1;
  let newNumber = 1;
  let index = 0;
  while (index < chunks.length) {
    const chunk = chunks[index];
    if (!chunk.added && !chunk.removed) {
      for (const text of chunk.value)
        rows.push({
          kind: "equal",
          oldNumber: oldNumber++,
          newNumber: newNumber++,
          before: [{ value: text }],
          after: [{ value: text }],
        });
      index++;
      continue;
    }
    const removed = [];
    const added = [];
    while (
      index < chunks.length &&
      (chunks[index].added || chunks[index].removed)
    ) {
      const target = chunks[index].removed ? removed : added;
      for (const text of chunks[index].value) target.push(text);
      index++;
    }
    for (
      let position = 0;
      position < Math.max(removed.length, added.length);
      position++
    ) {
      const oldText = removed[position];
      const newText = added[position];
      if (oldText !== undefined && newText !== undefined) {
        const parts = diffChars(oldText, newText, { timeout: 30 }) || [
          { removed: true, value: oldText },
          { added: true, value: newText },
        ];
        let removedCharacters = 0;
        let addedCharacters = 0;
        for (const part of parts) {
          if (part.removed) removedCharacters += lengthOf(part.value);
          if (part.added) addedCharacters += lengthOf(part.value);
        }
        const changed = Math.min(removedCharacters, addedCharacters);
        counts.characters.changed += changed;
        counts.characters.removed += removedCharacters - changed;
        counts.characters.added += addedCharacters - changed;
        counts.lines.changed++;
        rows.push({
          kind: "changed",
          oldNumber: oldNumber++,
          newNumber: newNumber++,
          before: parts.filter((part) => !part.added),
          after: parts.filter((part) => !part.removed),
        });
      } else if (oldText !== undefined) {
        counts.lines.removed++;
        counts.characters.removed += lengthOf(oldText);
        rows.push({
          kind: "removed",
          oldNumber: oldNumber++,
          before: [{ value: oldText, removed: true }],
        });
      } else {
        counts.lines.added++;
        counts.characters.added += lengthOf(newText);
        rows.push({
          kind: "added",
          newNumber: newNumber++,
          after: [{ value: newText, added: true }],
        });
      }
    }
  }
  return {
    rows,
    counts,
    identical:
      original.replace(/\r\n?/g, "\n") === modified.replace(/\r\n?/g, "\n"),
  };
}
