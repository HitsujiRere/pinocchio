import assert from "assert";
import { v4 as uuidv4 } from "uuid";
import {
  Add,
  Div,
  Equation,
  MathExpr,
  Mul,
  Number,
  Sub,
  Var,
} from "./math-tree";
import { Token, tokenize } from "./tokenize";
import { Field, FieldElem } from "./field";

export const parse = (expr: string, f: Field): Equation => {
  const tokens = tokenize(expr);
  return parseEq(tokens, f);
};

const parseEq = (tokens: Token[], f: Field): Equation => {
  const lhs = parseAdd(tokens, f);
  assert(tokens[0].kind == "reserved" && tokens[0].word == "=");
  tokens.shift();
  return {
    op: "eq",
    lhs,
    rhs: new FieldElem(37n, 3n),
  };
};

const parseAdd = (
  tokens: Token[],
  f: Field,
): Number | Var | Add | Sub | Mul | Div => {
  let lhs: Number | Var | Add | Sub | Mul | Div = parseMul(tokens, f);
  while (true) {
    if (tokens[0].kind == "reserved" && tokens[0].word == "+") {
      tokens.shift();
      lhs = { op: "add", sid: makeSignalID(), lhs, rhs: parseMul(tokens, f) };
    } else if (tokens[0].kind == "reserved" && tokens[0].word == "-") {
      tokens.shift();
      lhs = { op: "sub", sid: makeSignalID(), lhs, rhs: parseMul(tokens, f) };
    } else {
      break;
    }
  }
  return lhs;
};

const parseMul = (tokens: Token[], f: Field): Number | Var | Mul | Div => {
  let lhs: Number | Var | Mul | Div = parsePow(tokens, f);
  while (true) {
    if (tokens[0].kind == "reserved" && tokens[0].word == "*") {
      tokens.shift();
      lhs = { op: "mul", sid: makeSignalID(), lhs, rhs: parsePow(tokens, f) };
    } else if (tokens[0].kind == "reserved" && tokens[0].word == "/") {
      tokens.shift();
      lhs = { op: "div", sid: makeSignalID(), lhs, rhs: parsePow(tokens, f) };
    } else {
      break;
    }
  }
  return lhs;
};

const parsePow = (tokens: Token[], f: Field): Number | Var | Mul => {
  const lhs = parseUnary(tokens, f);
  let s: Number | Var | Mul = lhs;
  if (tokens[0].kind == "reserved" && tokens[0].word == "^") {
    tokens.shift();
    // @ts-ignore
    assert(tokens[0].kind == "number");
    // @ts-ignore
    for (let i = 1; i < tokens[0].value; i++) {
      s = { op: "mul", sid: makeSignalID(), lhs: s, rhs: lhs };
    }
    tokens.shift();
  }
  return s;
};

const parseUnary = (tokens: Token[], f: Field): Number | Var => {
  if (tokens[0].kind == "number") {
    const val = new FieldElem(f, BigInt(tokens[0].value));
    tokens.shift();
    return { op: "num", val };
  }

  if (tokens[0].kind == "ident") {
    const id = tokens[0].word;
    tokens.shift();
    return { op: "var", id };
  }

  throw new Error("Cannot parse word: " + tokens[0]);
};

const makeSignalID = (): string => {
  return uuidv4();
};
