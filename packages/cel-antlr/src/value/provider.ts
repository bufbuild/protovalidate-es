import {
  type CelValAdapter,
  CelType,
  type CelResult,
  CelMap,
  CelObject,
} from "./value.js";

export interface CelValProvider<V = any> {
  /** The adapter used to produce values from this provider. */
  readonly adapter: CelValAdapter<V>;

  /** Create a new value of the given type, from the given obj. */
  newValue(
    id: number,
    typeName: string,
    obj: CelObject | CelMap,
  ): CelResult<V> | undefined;

  findType(candidate: string): CelType | undefined;
  findIdent(id: number, ident: string): CelResult<V> | undefined;
}
