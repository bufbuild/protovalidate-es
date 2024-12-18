import { FuncRegistry } from "../func.js";
import { addCasts } from "./cast.js";
import { addLogic } from "./logic.js";
import { addMath } from "./math.js";
import { addTime } from "./time.js";

export function addStd(funcs: FuncRegistry) {
  addLogic(funcs);
  addMath(funcs);
  addCasts(funcs);
  addTime(funcs);
}

export const STD_FUNCS = new FuncRegistry();
addStd(STD_FUNCS);
