// import { v4 as uuidv4 } from "uuid";

let sIdIndex = 0;
export const makeSignalID = (): string => {
  // return uuidv4();
  sIdIndex++;
  return `t${sIdIndex}`;
};
