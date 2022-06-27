import { load } from "@docusaurus/core/lib/server";
import { applyConfigureWebpack } from "@docusaurus/core/lib/webpack/utils";
import createClientConfig from "@docusaurus/core/lib/webpack/client";
import type { LoadedPlugin } from "@docusaurus/types";
import type { Config } from "@jest/types";

type Opts = Config.InitialOptions;

process.stdout.write("Using Jest config for Docusaurus...\n");

const cwd = process.cwd();
const swapRootDir = (input: string | string[]): string[] => {
  // Just return everything as an array, even if it's a single string
  if (typeof input === "string") {
    input = [input];
  }
  return input.map((path) => path.replace(cwd, "<rootDir>"));
};

export const applyConfig = async (inputConfig: Opts): Promise<Opts> => {
  const newConfig = await makeConfig();

  // Map over each property and merge the values according to its type
  for (const key in newConfig) {
    const value = newConfig[key];

    if (key in inputConfig) {
      if (Array.isArray(inputConfig[key])) {
        inputConfig[key] = [...inputConfig[key], ...value];
      } else if (typeof inputConfig[key] === "object") {
        inputConfig[key] = { ...inputConfig[key], ...value };
      } else {
        inputConfig[key] = value;
      }
    } else {
      inputConfig[key] = value;
    }
  }

  return inputConfig;
};

export const makeConfig = async (): Promise<Opts> => {
  const props = await load({
    siteDir: process.cwd(),
  });

  // Load up the Docusaurus client Webpack config,
  // so we can extract its aliases
  let webpackConfig = await createClientConfig(props);

  // Allow plugins to make any final tweaks to the config
  (props.plugins as LoadedPlugin[])
    .filter((plugin) => "configureWebpack" in plugin)
    .forEach((plugin) => {
      webpackConfig = applyConfigureWebpack(
        plugin.configureWebpack!.bind(plugin),
        webpackConfig,
        false,
        props.siteConfig.webpack?.jsLoader,
        plugin.content
      );
    });

  const aliases = Object.entries(
    webpackConfig.resolve!.alias as Record<string, string | string[]>
  ).reduce((acc, [key, value]) => {
    acc[`^${key}$`] = swapRootDir(value);
    return acc;
  }, {});

  return {
    transformIgnorePatterns: ["node_modules/(?!@docusaurus/.*)"],
    moduleNameMapper: aliases,
  };
};
