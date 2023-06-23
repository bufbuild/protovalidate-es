import { FuncRegistry } from "../func";
import { addCasts } from "./cast";
import { addLogic } from "./logic";
import { addMath } from "./math";
import { addTime } from "./time";

export function addStd(funcs: FuncRegistry) {
  addLogic(funcs);
  addMath(funcs);
  addCasts(funcs);
  addTime(funcs);
}

export const STD_FUNCS = new FuncRegistry();
addStd(STD_FUNCS);
