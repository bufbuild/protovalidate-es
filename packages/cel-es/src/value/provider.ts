import {
  type CelValAdapter,
  CelType,
  type CelResult,
  CelMap,
  CelObject,
} from "./value";

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
