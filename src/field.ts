import assert from "assert";

// 有限体
export type Field = bigint;

// 有限体の要素
export class FieldElem {
  // 有限体
  f: Field;
  // 値
  n: bigint;

  constructor(f: Field, n: bigint) {
    assert(f >= 2);
    while (n < 0) n += f;
    this.f = f;
    this.n = n % f;
  }

  plus(rhs: FieldElem): FieldElem {
    assert(this.f == rhs.f);
    return new FieldElem(this.f, this.n + rhs.n);
  }

  minus(rhs: FieldElem): FieldElem {
    assert(this.f == rhs.f);
    return new FieldElem(this.f, this.n - rhs.n);
  }

  times(rhs: FieldElem): FieldElem {
    assert(this.f == rhs.f);
    return new FieldElem(this.f, this.n * rhs.n);
  }

  div(rhs: FieldElem): FieldElem {
    return this.times(rhs.inv());
  }

  pow(n: bigint): FieldElem {
    assert(n >= 0);
    let x = new FieldElem(this.f, this.n);
    let r = new FieldElem(this.f, 1n);
    while (n) {
      if (n % 2n == 1n) r = r.times(x);
      x = x.times(x);
      n /= 2n;
    }
    return r;
  }

  inv(): FieldElem {
    assert(this.n != 0n);
    let a = this.n;
    let b = this.f;
    let u = 1n;
    let v = 0n;
    while (b) {
      const t = a / b;
      a -= t * b;
      [a, b] = [b, a];
      u -= t * v;
      [u, v] = [v, u];
    }
    u %= this.f;
    if (u < 0) u += this.f;
    return new FieldElem(this.f, u);
  }
}

const gcd = (x: bigint, y: bigint): bigint => {
  if (x % y) {
    return gcd(y, x % y);
  } else {
    return y;
  }
};
