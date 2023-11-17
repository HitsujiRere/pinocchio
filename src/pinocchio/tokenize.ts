export type Token = NumberToken | ReservedToken | IdentToken | EndToken;

export type NumberToken = {
  kind: "number";
  value: number;
};

export const reservedWords = ["+", "-", "*", "/", "^", "="] as const;
export type ReservedToken = {
  kind: "reserved";
  word: (typeof reservedWords)[number];
};

export type IdentToken = {
  kind: "ident";
  word: string;
};

export type EndToken = {
  kind: "end";
};

export const tokenize = (expr: string): Token[] => {
  const tokens: Token[] = [];

  loop: while (expr.length > 0) {
    if (expr[0] == " ") {
      expr = expr.slice(1);
      continue loop;
    }

    if ("0" <= expr[0] && expr[0] <= "9") {
      let word = expr[0];
      expr = expr.slice(1);
      while ("0" <= expr[0] && expr[0] <= "9") {
        word += expr[0];
        expr = expr.slice(1);
      }
      tokens.push({
        kind: "number",
        value: Number(word),
      });
      continue loop;
    }

    for (const word of reservedWords) {
      if (expr.slice(0, word.length) == word) {
        expr = expr.slice(word.length);
        tokens.push({
          kind: "reserved",
          word: word,
        });
        continue loop;
      }
    }

    if ("a" <= expr[0] && expr[0] <= "z") {
      let word = expr[0];
      expr = expr.slice(1);
      while (
        ("a" <= expr[0] && expr[0] <= "z") ||
        ("0" <= expr[0] && expr[0] <= "9")
      ) {
        word += expr[0];
        expr = expr.slice(1);
      }
      tokens.push({
        kind: "ident",
        word: word,
      });
      continue loop;
    }

    // Don't match
    expr = expr.slice(1);
  }

  return tokens;
};
