import { type CelValAdapter } from "./adapter";
import { CelMap } from "./map";
import { CelObject } from "./struct";
import { CelType, type CelResult } from "./value";

export interface CelValProvider {
  /** The adapter used to produce values from this provider. */
  readonly adapter: CelValAdapter;
  /** Create a new value of the given type, from the given obj. */
  newValue(
    id: number,
    typeName: string,
    obj: CelObject | CelMap
  ): CelResult | undefined;
  findType(candidate: string): CelType | undefined;
  findIdent(id: number, ident: string): CelResult | undefined;
}
