import { FieldElem } from "./field";

// 数式
export type MathExpr = Equation | Number | Var | Add | Sub | Mul | Div;

// 等式
export type Equation = {
  op: "eq";
  lhs: Exclude<MathExpr, Equation>;
  rhs: FieldElem;
};

// 数
export type Number = {
  op: "num";
  val: FieldElem;
};

// 変数
export type Var = {
  op: "var";
  id: string;
};

// 加算
export type Add = {
  op: "add";
  sid: string;
  lhs: Exclude<MathExpr, Equation>;
  rhs: Exclude<MathExpr, Equation>;
};

// 減算
export type Sub = {
  op: "sub";
  sid: string;
  lhs: Exclude<MathExpr, Equation>;
  rhs: Exclude<MathExpr, Equation>;
};

// 乗算
export type Mul = {
  op: "mul";
  sid: string;
  lhs: Exclude<MathExpr, Equation>;
  rhs: Exclude<MathExpr, Equation>;
};

// 除算
export type Div = {
  op: "div";
  sid: string;
  lhs: Exclude<MathExpr, Equation>;
  rhs: Exclude<MathExpr, Equation>;
};
