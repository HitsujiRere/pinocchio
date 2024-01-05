import assert from "assert";
import { Field, FieldElem } from "./field";

export class Polynomial {
  f: Field;
  coeffs: FieldElem[];

  constructor(f: Field, coeffs: FieldElem[] = []) {
    this.f = f;
    this.coeffs = coeffs;
  }

  static from(f: Field, coeffs: bigint[]): Polynomial {
    return new Polynomial(
      f,
      coeffs.map((x) => new FieldElem(f, x)),
    );
  }

  static zero(f: Field, size: number): Polynomial {
    return Polynomial.from(f, new Array(size).fill(0n));
  }

  static makeX(f: Field, order: number, coeff: FieldElem): Polynomial {
    assert(order >= 0);
    const pol = Polynomial.zero(f, order + 1);
    pol.coeffs[order] = coeff;
    return pol;
  }

  getCoeff(order: number): FieldElem {
    if (order < this.coeffs.length) {
      return this.coeffs[order];
    } else {
      return new FieldElem(this.f, 0n);
    }
  }

  is_zero(): boolean {
    return this.coeffs.every((coeff) => coeff.n == 0n);
  }

  plus(rhs: Polynomial): Polynomial {
    assert(this.f == rhs.f);
    const pol = Polynomial.zero(
      this.f,
      Math.max(this.coeffs.length, rhs.coeffs.length),
    );
    for (let i = 0; i < pol.coeffs.length; i++) {
      pol.coeffs[i] = this.getCoeff(i).plus(rhs.getCoeff(i));
    }
    return pol;
  }

  minus(rhs: Polynomial): Polynomial {
    assert(this.f == rhs.f);
    const pol = Polynomial.zero(
      this.f,
      Math.max(this.coeffs.length, rhs.coeffs.length),
    );
    for (let i = 0; i < pol.coeffs.length; i++) {
      pol.coeffs[i] = this.getCoeff(i).minus(rhs.getCoeff(i));
    }
    return pol;
  }

  times(rhs: Polynomial): Polynomial {
    assert(this.f == rhs.f);
    const pol = Polynomial.zero(
      this.f,
      this.coeffs.length + rhs.coeffs.length - 1,
    );
    for (let i = 0; i < this.coeffs.length; i++) {
      for (let j = 0; j < rhs.coeffs.length; j++) {
        pol.coeffs[i + j] = pol
          .getCoeff(i + j)
          .plus(this.getCoeff(i).times(rhs.getCoeff(j)));
      }
    }
    return pol;
  }

  times_sc(rhs: FieldElem): Polynomial {
    assert(this.f == rhs.f);
    const pol = Polynomial.zero(this.f, this.coeffs.length);
    for (let i = 0; i < pol.coeffs.length; i++) {
      pol.coeffs[i] = this.getCoeff(i).times(rhs);
    }
    return pol;
  }

  div_sc(rhs: FieldElem): Polynomial {
    assert(this.f == rhs.f);
    const pol = Polynomial.zero(this.f, this.coeffs.length);
    for (let i = 0; i < pol.coeffs.length; i++) {
      pol.coeffs[i] = this.getCoeff(i).div(rhs);
    }
    return pol;
  }

  divisible_by(rhs: Polynomial): boolean {
    return true;
  }

  toString(): string {
    return this.is_zero()
      ? "0"
      : this.coeffs
          .map((coeff, order) => {
            if (coeff.n == 0n) return undefined;
            if (order == 0) return `${coeff.n}`;
            else if (coeff.n == 1n) return `x^${order}`;
            else return `${coeff.n}x^${order}`;
          })
          .filter((x) => x != undefined)
          .join(" + ");
  }

  substitute(x: FieldElem): FieldElem {
    assert(this.f == x.f);
    let sum = new FieldElem(this.f, 0n);
    for (let i = 0; i < this.coeffs.length; i++) {
      sum = sum.plus(this.coeffs[i].times(x.pow(BigInt(i))));
    }
    return sum;
  }

  toJSON(): string {
    return this.toString();
  }
}
