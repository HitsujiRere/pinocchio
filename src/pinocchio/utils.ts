Object.defineProperty(BigInt.prototype, "toJSON", {
  get() {
    "use strict";
    return () => `${this}n`;
  },
});
