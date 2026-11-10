import test from "node:test";
import assert from "node:assert/strict";
import { compareTexts } from "./comparison.js";

test("pairs modified lines and counts character replacements separately", () => {
  const result = compareTexts(
    "hello world\nkeep\nold",
    "hello there!\nkeep\nold\nnew",
  );
  assert.deepEqual(result.counts.lines, { added: 1, removed: 0, changed: 1 });
  assert.equal(result.rows[0].kind, "changed");
  assert.ok(result.rows[0].before.some((part) => part.removed));
  assert.ok(result.rows[0].after.some((part) => part.added));
  assert.equal(result.rows.at(-1).newNumber, 4);
});

test("counts added, removed and changed characters without double counting", () => {
  assert.deepEqual(compareTexts("cat", "cut!").counts.characters, {
    added: 1,
    removed: 0,
    changed: 1,
  });
  assert.deepEqual(compareTexts("cut!", "cat").counts.characters, {
    added: 0,
    removed: 1,
    changed: 1,
  });
  assert.deepEqual(compareTexts("", "hello").counts.characters, {
    added: 5,
    removed: 0,
    changed: 0,
  });
});

test("handles empty input, blank lines, CRLF and final newline", () => {
  assert.equal(compareTexts("", "").rows.length, 0);
  assert.equal(compareTexts("one\r\ntwo", "one\ntwo").identical, true);
  assert.equal(compareTexts("one", "one\n").counts.lines.added, 1);
  assert.equal(compareTexts("one\n\ntwo", "one\ntwo").counts.lines.removed, 1);
});

test("counts Unicode code points and maintains both line number sequences", () => {
  assert.equal(compareTexts("", "\u{1F600}").counts.characters.added, 1);
  const result = compareTexts("first\nremoved\nlast", "first\nlast");
  assert.equal(result.rows.at(-1).oldNumber, 3);
  assert.equal(result.rows.at(-1).newNumber, 2);
});

test("handles a large mostly unchanged document", () => {
  const text = Array.from(
    { length: 20000 },
    (_, index) => `Line ${index}`,
  ).join("\n");
  const result = compareTexts(
    text,
    text.replace("Line 10000", "Changed 10000"),
  );
  assert.equal(result.rows.length, 20000);
  assert.equal(result.counts.lines.changed, 1);
});

test("handles an added block larger than the JavaScript argument limit", () => {
  const text = "new line\n".repeat(150000);
  const result = compareTexts("", text);
  assert.equal(result.counts.lines.added, 150001);
  assert.equal(result.counts.characters.added, 1200000);
});
