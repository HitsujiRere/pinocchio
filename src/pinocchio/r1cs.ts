import { Field, FieldElem } from "./field";
import { Gate, One, Out, Term, TmpVar, Var } from "./gate";

// 制約
export type Constraint = {
  a: FieldElem[];
  b: FieldElem[];
  c: FieldElem[];
};

export type R1CSTmpl = {
  f: Field;
  constraints: Constraint[];
  witness: (One | Var | TmpVar | Out)[];
  indices: Map<string, number>;
};

export type R1CS = {
  constraints: Constraint[];
  witness: FieldElem[];
};

export const buildR1CSRTmpl = (f: Field, gates: Gate[]): R1CSTmpl => {
  const tmpl: R1CSTmpl = {
    f,
    constraints: [],
    witness: [],
    indices: new Map(),
  };
  addWitnessTerm(tmpl, { gate: "one" });

  for (const gate of gates) {
    addWitnessTerm(tmpl, gate.a);
    addWitnessTerm(tmpl, gate.b);
    addWitnessTerm(tmpl, gate.c);
  }

  let vecSize = tmpl.witness.length;
  for (const gate of gates) {
    const a = new Array(vecSize).fill(0).map((x) => new FieldElem(f, 0n));
    buildConstraintVec(tmpl, f, a, gate.a);

    const b = new Array(vecSize).fill(0).map((x) => new FieldElem(f, 0n));
    buildConstraintVec(tmpl, f, b, gate.b);

    const c = new Array(vecSize).fill(0).map((x) => new FieldElem(f, 0n));
    buildConstraintVec(tmpl, f, c, gate.c);

    const constraints: Constraint = { a, b, c };
    tmpl.constraints.push(constraints);
  }

  return tmpl;
};

export const buildR1CS = (
  f: Field,
  tmpl: R1CSTmpl,
  witness: Map<Term, FieldElem>,
): R1CS => {
  const r1cs: R1CS = {
    constraints: tmpl.constraints,
    witness: new Array(tmpl.constraints.length).fill(0),
  };
  tmpl.witness.forEach((w, i) => {
    if (w.gate == "one") {
      r1cs.witness[i] = new FieldElem(f, 1n);
    } else {
      r1cs.witness[i] = witness.get(w)!;
    }
  });
  return r1cs;
};

const addWitnessTerm = (tmpl: R1CSTmpl, t: Term) => {
  if (t.gate == "sum") {
    addWitnessTerm(tmpl, t.lhs);
    addWitnessTerm(tmpl, t.rhs);
  } else if (t.gate == "num") {
  } else {
    const ts = JSON.stringify(t);
    if (!tmpl.indices.has(ts)) {
      tmpl.witness.push(t);
      tmpl.indices.set(ts, tmpl.indices.size);
    }
  }
};

const buildConstraintVec = (
  tmpl: R1CSTmpl,
  f: Field,
  vec: FieldElem[],
  term: Term,
) => {
  if (term.gate == "sum") {
    buildConstraintVec(tmpl, f, vec, term.lhs);
    buildConstraintVec(tmpl, f, vec, term.rhs);
  } else if (term.gate == "num") {
    vec[0] = term.val;
  } else {
    const at = tmpl.indices.get(JSON.stringify(term)) as number;
    vec[at] = new FieldElem(f, 1n);
  }
};
