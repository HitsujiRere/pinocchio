import { generateQAP, verify } from "./pinocchio";

const qap = generateQAP("x^3 + x + 5 = 35", 37n);

const testcases: { name: string; testcase: bigint[] }[] = [
  {
    name: "good-testcase",
    testcase: [3n, 9n, 27n, 30n, 35n],
  },
  {
    name: "bad-testcase",
    testcase: [3n, 9n, 28n, 30n, 35n],
  },
];

for (const { name, testcase } of testcases) {
  if (verify(qap, testcase)) {
    console.log(`${name} is valid!`);
  } else {
    console.log(`${name} is unvalid!`);
  }
}
