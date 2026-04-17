// Minimal regression test for JS visualizer instrumentation insertion ordering.
// Run: `node test_js_instrument_order.js`

function applyInsertions(code, insertions) {
  insertions.sort((a, b) => (b.pos - a.pos) || (b.rank - a.rank) || (b.seq - a.seq));
  let out = code;
  for (const ins of insertions) out = out.slice(0, ins.pos) + ins.str + out.slice(ins.pos);
  return out;
}

function assertEq(got, want, msg) {
  if (got !== want) {
    console.error("FAIL:", msg);
    console.error("got :", JSON.stringify(got));
    console.error("want:", JSON.stringify(want));
    process.exit(1);
  }
}

// Same-position insertions at node.start must produce "{ __step__" (not "__step__ {").
{
  const code = "X";
  const insertions = [
    { pos: 0, str: "__step__(1,'line');\n", rank: 10, seq: 0 },
    { pos: 0, str: "{ ", rank: 0, seq: 1 },
  ];
  const out = applyInsertions(code, insertions);
  assertEq(out, "{ __step__(1,'line');\nX", "open brace precedes step at same pos");
}

// Same-position insertions at node.end must produce "vars }" (not "} vars").
{
  const code = "let x=1";
  const insertions = [
    { pos: code.length, str: "; __var__('x', x)\n", rank: 10, seq: 0 },
    { pos: code.length, str: " }", rank: 20, seq: 1 },
  ];
  const out = applyInsertions(code, insertions);
  assertEq(out, "let x=1; __var__('x', x)\n }", "close brace follows end instrumentation");
}

console.log("OK");

