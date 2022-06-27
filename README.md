# jest-config-docusaurus

🃏 A Jest config extension to aid in testing with [Docusaurus](https://docusaurus.io/).

Essentially all it does is tap into your Docusaurus setup and retrieve all the aliases used for Webpack, which it then converts to Jest [module mappings](https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring) so they can be injected into your config. It also ensures transforming can occur with Docusaurus dependencies.

⚠️ This is a work in progress! If you have time and would like to improve this package please go ahead and open a PR.

## Usage

Here's how to use this addon:

- [Set up Jest](https://jestjs.io/docs/getting-started) in your project. You'll need a `jest.config.js` file that exports a config as an async function.
- Install the dependency with `yarn add --dev jest-config-docusaurus` or `npm i --save-dev jest-config-docusaurus`
- Import the `applyConfig` helper, call it with your existing config, and return the result as your final config. For example:

```ts
import { applyConfig } from "jest-config-docusaurus";

export default async () =>
  await applyConfig({
    // Project-specific config that will be applied as well
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    moduleNameMapper: {
      "^.+\\.(jpg|jpeg|png|svg)$": "<rootDir>/fileMock.js",
      "^.+\\.(css|scss)$": "identity-obj-proxy",
    },
  });
```

You can also import and call `makeConfig` directly if you just want to retrieve the config without layering in your own.

### Using with TypeScript

If your test setup [involves TypeScript](https://jestjs.io/docs/getting-started#using-typescript) you'll probably need to tell TypeScript how to locate the mapped modules as well. This can't be done dynamically, but here's an example `tsconfig.json` to get you most of the way there:

```jsonc
{
  "extends": "@tsconfig/docusaurus/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      // Import notes about paths for theme-related paths:
      // - @theme paths should point to the topmost component, including swizzled versions
      // - @theme-original paths should point to the topmost component, exluding swizzled versions
      // - @theme-init paths should point to the bottommost component typically the theme or plugin that first provided it
      // This means certain instances of these paths may need to supercede /* wildcards.
      // https://docusaurus.io/docs/next/advanced/client#theme-aliases
      "@theme-original/*": [
        "./node_modules/@docusaurus/theme-classic/lib/theme/*"
      ],
      "@theme-init/*": ["./node_modules/@docusaurus/theme-classic/lib/theme/*"],
      "@theme/*": ["./node_modules/@docusaurus/theme-classic/lib/theme/*"],
      "@docusaurus/*": ["./node_modules/@docusaurus/core/src/client/exports/*"],
      "@site/*": ["./*"],
      "@generated/*": ["./.docusaurus/*"]
    }
  }
}
```

## License

MIT
