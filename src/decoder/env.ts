import * as t from "io-ts";
import { fromDecoder } from "../domain/action";

export const EnvDecoder = t.type(
  {
    redis: t.string,
    pair: t.string,
  },
  "Env"
);
