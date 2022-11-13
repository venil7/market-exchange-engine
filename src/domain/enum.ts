import { pipe } from "fp-ts/lib/function";
import { map } from "fp-ts/lib/Array";
import { fromEntries, toEntries } from "fp-ts/lib/Record";
import { swap } from "fp-ts/lib/Tuple";

export const inverse = <T extends Record<string, string>>(
  enumeration: T
): Record<string, string> =>
  pipe(enumeration, toEntries, map(swap), fromEntries);
