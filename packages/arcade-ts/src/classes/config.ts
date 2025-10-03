export class Config {
  constructor(
    public project: string,
    public rpc: string,
    public policies: string,
  ) {
    this.project = project;
    this.rpc = rpc;
    this.policies = policies;
  }

  static default() {
    return new Config("", "", "");
  }

  static from(value: string) {
    try {
      const json = JSON.parse(value.replace('"{', "{").replace('}"', "}"));
      return new Config(json.project, json.rpc, json.policies);
    } catch (error: unknown) {
      console.error("Error parsing config:", error);
      return Config.default();
    }
  }
}
