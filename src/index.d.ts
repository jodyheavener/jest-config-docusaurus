import { Config } from "@jest/types";

export function applyConfig(
  config: Config.InitialOptions
): Promise<Config.InitialOptions>;

export function makeConfig(localPath?: string): Promise<Config.InitialOptions>;
