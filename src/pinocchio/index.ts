import "./utils";
import { FieldElem } from "./field";
import { parse } from "./parse";
import { buildGate } from "./gate";
import { buildR1CSRTmpl } from "./r1cs";
import { QAP, buildQAP } from "./qap";
import { check } from "./check";

export const generateQAP = (expr: string, field: bigint): QAP => {
  const exprTree = parse(expr, field);

  const gates = buildGate(field, exprTree);

  const r1cs = buildR1CSRTmpl(field, gates);

  const qap = buildQAP(r1cs);

  return qap;
};

export const verify = (qap: QAP, testcase: bigint[]): boolean => {
  return check(
    qap,
    testcase.map((x) => new FieldElem(qap.a[0].f, x)),
  );
};
