export class Namespace {
  private readonly _name: string;
  private _aliases: Map<string, string>;

  constructor(name = "") {
    this._name = name;
    this._aliases = new Map();
  }

  static ROOT: Namespace = new Namespace();

  name(): string {
    return this._name;
  }

  aliases(): Map<string, string> {
    return this._aliases;
  }

  resolveCandidateNames(name: string): string[] {
    if (name.startsWith(".")) {
      const qn = name.substring(1);
      const alias = this.findAlias(qn);
      if (alias !== undefined) {
        return [alias];
      }
      return [qn];
    }
    const alias = this.findAlias(name);
    if (alias !== undefined) {
      return [alias];
    }
    if (this.name() === "") {
      return [name];
    }
    let nextCont = this.name();
    const candidates = [nextCont + "." + name];
    for (
      let i = nextCont.lastIndexOf(".");
      i >= 0;
      i = nextCont.lastIndexOf(".")
    ) {
      nextCont = nextCont.substring(0, i);
      candidates.push(nextCont + "." + name);
    }
    candidates.push(name);
    return candidates;
  }

  findAlias(name: string): string | undefined {
    let simple = name;
    let qualifier = "";
    const dot = name.indexOf(".");
    if (dot >= 0) {
      simple = name.substring(0, dot);
      qualifier = name.substring(dot);
    }
    const alias = this._aliases.get(simple);
    if (alias === undefined) {
      return undefined;
    }
    return alias + qualifier;
  }
}
