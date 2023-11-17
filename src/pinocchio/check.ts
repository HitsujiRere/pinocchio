import { FieldElem } from "./field";
import { QAP } from "./qap";
import { Polynomial } from "./polynomial";

export const check = (qap: QAP, witness: FieldElem[]): boolean => {
  if (qap.a.length != witness.length) return false;
  if (qap.b.length != witness.length) return false;
  if (qap.c.length != witness.length) return false;

  const f = qap.a[0].f;

  const a = qap.a.map((p, i) => p.times_sc(witness[i]));
  const b = qap.b.map((p, i) => p.times_sc(witness[i]));
  const c = qap.c.map((p, i) => p.times_sc(witness[i]));

  const af = a.reduce((sum, p) => sum.plus(p), new Polynomial(f));
  const bf = b.reduce((sum, p) => sum.plus(p), new Polynomial(f));
  const cf = c.reduce((sum, p) => sum.plus(p), new Polynomial(f));
  let t = af.times(bf).minus(cf);

  let z = Polynomial.from(f, [1n]);
  for (let i = 0; i < 4; i++) {
    z = z.times(Polynomial.from(f, [BigInt(-i - 1), 1n]));
  }

  for (let i = t.coeffs.length - 1; i >= z.coeffs.length - 1; i--) {
    let x = z.times(
      Polynomial.makeX(f, i - z.coeffs.length + 1, t.getCoeff(i)!),
    );
    t = t.minus(x);
  }

  return t.is_zero();
};
