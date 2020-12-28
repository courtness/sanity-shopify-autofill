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
 * @return {null}
 */
export const setShopifyBaseURL = () => {
  const { args } = global;

  if (
    !args?.[`shopify-key`] ||
    !args?.[`shopify-password`] ||
    !args?.[`shopify-store`]
  ) {
    throw new Error(
      `Required config parameters are missing (Shopify key, password, store)`
    );
  }

  global.shopifyBaseURL = `https://${args[`shopify-key`]}:${
    args[`shopify-password`]
  }@${args[`shopify-store`]}.myshopify.com/admin/api/${
    args[`shopify-version`]
  }`;
};

/**
 * -----------------------------------------------------------------------------
 * Set the pagesize either to the user-specified value or 50 by default.
 * @return {null}
 */
export const setShopifyPagesize = () => {
  global.shopifyPagesize = global?.args?.[`shopify-pagesize`] || 50;
};

/**
 * -----------------------------------------------------------------------------
 * Store user CLI arguments if they're not already and call the Shopify setters.
 * @return {null}
 */
export const setShopify = () => {
  if (!global?.args) {
    storeArgs();
  }

  try {
    setShopifyBaseURL();
    setShopifyPagesize();
  } catch (err) {
    console.error(`[err]  Failed to set Shopify configuration:`);
    console.error(`${err}\n`);
  }
};
