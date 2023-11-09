import { FieldElem } from "./field";
import { MathExpr } from "./math-tree";
import { makeSignalID } from "./parse";
import { buildGate } from "./gate";
import { buildR1CSRTmpl } from "./r1cs";
import { buildQAP } from "./qap";
import {} from "./polynomial";
import { check } from "./check";

console.log("hello world!");

// for (let i = 1n; i <= 10n; i++) {
//   const a = new FieldElem(1000000007n, i);
//   console.log(a, a.inv());
// }

const f = 37n;

// x^3 + x + 5 = 35
const expr: MathExpr = {
  op: "eq",
  lhs: {
    op: "add",
    sid: makeSignalID(),
    lhs: {
      op: "mul",
      sid: makeSignalID(),
      lhs: {
        op: "mul",
        sid: makeSignalID(),
        lhs: { op: "var", id: "x" },
        rhs: { op: "var", id: "x" },
      },
      rhs: { op: "var", id: "x" },
    },
    rhs: {
      op: "add",
      sid: makeSignalID(),
      lhs: { op: "var", id: "x" },
      rhs: { op: "num", val: new FieldElem(f, 5n) },
    },
  },
  rhs: new FieldElem(f, 35n),
};

// console.log(expr);

/*
  [
    "x" * "x" = t1,
    t1 * "x" = t2,
    ("x" + 5) * 1 = t3,
    (t2 + t3) * 1 = out,
  ]
*/
const gates = buildGate(f, expr);
console.log(gates);

const r1cs = buildR1CSRTmpl(f, gates);
const witness = r1cs.witness;
console.log(r1cs);
console.log(
  "w =",
  witness.map((w) => {
    if (w.gate == "one") return "1";
    if (w.gate == "out") return "out";
    if (w.gate == "var") return w.id;
    if (w.gate == "tmpvar") return w.sid;
  }),
);
for (const constraint of r1cs.constraints) {
  const a = constraint.a.map((x) => x.n);
  const b = constraint.b.map((x) => x.n);
  const c = constraint.c.map((x) => x.n);
  console.log(a, ". w *", b, ". w *", c, ". w = 0");
}

const qap = buildQAP(r1cs);
console.log(qap.a.map((p) => p.toString()));
console.log(qap.b.map((p) => p.toString()));
console.log(qap.c.map((p) => p.toString()));

for (let x = 1; x <= r1cs.constraints.length; x++) {
  console.log("x :=", x);
  const xe = new FieldElem(f, BigInt(x));
  console.log(
    "\ta =",
    qap.a.map((p) => p.substitute(xe).n),
  );
  console.log(
    "\tb =",
    qap.b.map((p) => p.substitute(xe).n),
  );
  console.log(
    "\tc =",
    qap.c.map((p) => p.substitute(xe).n),
  );
}

const testcases: { name: string; testcase: FieldElem[] }[] = [
  {
    name: "good-testcase",
    testcase: [1n, 3n, 9n, 27n, 8n, 35n].map((x) => new FieldElem(f, x)),
  },
  {
    name: "bad-testcase",
    testcase: [1n, 4n, 9n, 27n, 8n, 35n].map((x) => new FieldElem(f, x)),
  },
];

for (const { name, testcase } of testcases) {
  if (check(qap, testcase)) {
    console.log(`${name} is valid!`);
  } else {
    console.log(`${name} is unvalid!`);
  }
}
