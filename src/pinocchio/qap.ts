import { FieldElem } from "./field";
import { R1CSTmpl } from "./r1cs";
import { Polynomial } from "./polynomial";

export type QAP = {
  a: Polynomial[];
  b: Polynomial[];
  c: Polynomial[];
};

export const buildQAP = (tmpl: R1CSTmpl): QAP => {
  const a: FieldElem[][] = [];
  const b: FieldElem[][] = [];
  const c: FieldElem[][] = [];
  for (const constraint of tmpl.constraints) {
    a.push(constraint.a);
    b.push(constraint.b);
    c.push(constraint.c);
  }
  const at = transpose(a);
  const bt = transpose(b);
  const ct = transpose(c);

  const qap: QAP = {
    a: at.map((x) => buildPolynomial(x)),
    b: bt.map((x) => buildPolynomial(x)),
    c: ct.map((x) => buildPolynomial(x)),
  };
  return qap;
};

const transpose = <T>(m: T[][]): T[][] => {
  const n: T[][] = [];
  for (let c = 0; c < m[0].length; c++) {
    const col = [];
    for (let r = 0; r < m.length; r++) {
      col.push(m[r][c]);
    }
    n.push(col);
  }
  return n;
};

const buildPolynomial = (a: FieldElem[]): Polynomial => {
  const f = a[0].f;
  let polynomial = Polynomial.zero(f, a.length);
  for (let i = 0; i < a.length; i++) {
    if (a[i].n == 0n) continue;
    let pol = new Polynomial(f, [a[i]]);
    for (let j = 0; j < a.length; j++) {
      if (i == j) continue;
      const top = Polynomial.from(f, [BigInt(-j - 1), 1n]);
      pol = pol.times(top);
      pol = pol.div_sc(new FieldElem(f, BigInt(i - j)));
    }
    polynomial = polynomial.plus(pol);
  }
  return polynomial;
};
