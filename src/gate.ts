import { Field, FieldElem } from "./field";
import { Equation, MathExpr } from "./math-tree";

// 算術回路
export type Gate = {
  a: Term;
  b: Term;
  c: Term;
};

export type Term = Num | One | Out | Sum | TmpVar | Var;

export type Num = {
  gate: "num";
  val: FieldElem;
};

export type One = {
  gate: "one";
};

export type Out = {
  gate: "out";
};

export type Sum = {
  gate: "sum";
  lhs: Exclude<Term, Out | Sum>;
  rhs: Exclude<Term, Out | Sum>;
};

export type TmpVar = {
  gate: "tmpvar";
  sid: string;
};

export type Var = {
  gate: "var";
  id: string;
};

export const buildGate = (f: Field, expr: Equation) => {
  const gates: Gate[] = [];
  traverseLHS(f, expr.lhs, gates);
  gates.at(-1)!.c = { gate: "out" };
  return gates;
};

const traverseLHS = (
  f: Field,
  expr: Exclude<MathExpr, Equation>,
  gates: Gate[],
): Exclude<Term, Out | Sum> => {
  if (expr.op == "num") {
    return {
      gate: "num",
      val: expr.val,
    };
  }

  if (expr.op == "var") {
    return {
      gate: "var",
      id: expr.id,
    };
  }

  if (expr.op == "add") {
    let a = traverseLHS(f, expr.lhs, gates);
    let b = traverseLHS(f, expr.rhs, gates);
    let c: TmpVar = { gate: "tmpvar", sid: expr.sid };
    // a + b = c => (a + b) * 1 = c
    let sum: Sum = { gate: "sum", lhs: a, rhs: b };
    gates.push({ a: sum, b: { gate: "one" }, c: c });
    return c;
  }

  if (expr.op == "sub") {
    let a = traverseLHS(f, expr.lhs, gates);
    let b = traverseLHS(f, expr.rhs, gates);
    let c: TmpVar = { gate: "tmpvar", sid: expr.sid };
    // a - b = c => (b + c) * 1 = a
    let sum: Sum = { gate: "sum", lhs: b, rhs: c };
    gates.push({ a: sum, b: { gate: "one" }, c: a });
    return c;
  }

  if (expr.op == "mul") {
    let a = traverseLHS(f, expr.lhs, gates);
    let b = traverseLHS(f, expr.rhs, gates);
    let c: TmpVar = { gate: "tmpvar", sid: expr.sid };
    gates.push({ a: a, b: b, c: c });
    return c;
  }

  if (expr.op == "div") {
    let a = traverseLHS(f, expr.lhs, gates);
    let b = traverseLHS(f, expr.rhs, gates);
    let c: TmpVar = { gate: "tmpvar", sid: expr.sid };
    // a / b = c => b * c = a
    gates.push({ a: b, b: c, c: a });
    return c;
  }

  throw new Error();
};
