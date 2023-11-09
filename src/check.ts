import { FieldElem } from "./field";
import { QAP } from "./qap";
import { Polynomial } from "./polynomial";

export const check = (qap: QAP, witness: FieldElem[]): boolean => {
  const f = qap.a[0].f;

  const a = qap.a.map((p, i) => p.times_sc(witness[i]));
  const b = qap.b.map((p, i) => p.times_sc(witness[i]));
  const c = qap.c.map((p, i) => p.times_sc(witness[i]));
  // console.log(a.map((p) => p.toString()));
  // console.log(b.map((p) => p.toString()));
  // console.log(c.map((p) => p.toString()));

  const af = a.reduce((sum, p) => sum.plus(p), new Polynomial(f));
  const bf = b.reduce((sum, p) => sum.plus(p), new Polynomial(f));
  const cf = c.reduce((sum, p) => sum.plus(p), new Polynomial(f));
  let t = af.times(bf).minus(cf);
  // console.log(af.toString());
  // console.log(bf.toString());
  // console.log(cf.toString());
  // console.log(t.toString());

  let z = Polynomial.from(f, [1n]);
  for (let i = 0; i < 4; i++) {
    z = z.times(Polynomial.from(f, [BigInt(-i - 1), 1n]));
  }
  // console.log(z.toString());

  for (let i = t.coeffs.length - 1; i >= z.coeffs.length - 1; i--) {
    let x = z.times(
      Polynomial.makeX(f, i - z.coeffs.length + 1, t.getCoeff(i)!),
    );
    t = t.minus(x);
  }

  return t.is_zero();
};
