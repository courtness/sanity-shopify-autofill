import fs from "fs";
import parseArgs from "minimist";

/**
 * -----------------------------------------------------------------------------
 * Store user-supplied CLI arguments in the global object.
 * @return {null}
 */
export const storeArgs = () => {
  const args = parseArgs(process.argv.slice(2));
  const parsedArgs = {};

  Object.keys(args).forEach((key) => {
    if (key !== `_`) {
      parsedArgs[key.toLowerCase()] = args[key];
    }
  });

  if (!parsedArgs?.[`shopify-version`]) {
    parsedArgs[`shopify-version`] = `2020-07`;
  }

  global.args = parsedArgs;
};

/**
 * -----------------------------------------------------------------------------
 * Create the dist cache folders for imported Shopify products / exported Sanity
 * documents.
 * @return {null}
 */
export const setFileSystem = () => {
  const directories = {
    cache: `${global.dirname}/.cache`,
    import: `${global.dirname}/.cache/import`,
    export: `${global.dirname}/.cache/export`
  };

  Object.keys(directories).forEach((directoryKey) => {
    const directory = directories[directoryKey];

    global[`${directoryKey}Directory`] = directory;

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
  });
};

/**
 * -----------------------------------------------------------------------------
 * Generate an authenticated base URL from user-supplied CLI Shopify credentials.
 * @return {string} A Shopify API URL.
 */
export const setBaseShopifyURL = () => {
  const { args } = global;

  if (
    !args?.[`shopify-key`] ||
    !args?.[`shopify-password`] ||
    !args?.[`shopify-store`]
  ) {
    console.error(`Required config params missing`);
    return null;
  }

  return `https://${args[`shopify-key`]}:${args[`shopify-password`]}@${
    args[`shopify-store`]
  }.myshopify.com/admin/api/${args[`shopify-version`]}`;
};

export const setShopifyPagesize = () => {
  return global?.args?.[`shopify-limit`] || 50;
};
