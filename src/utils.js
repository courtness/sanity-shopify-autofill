import fs from "fs";
import parseArgs from "minimist";

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

  global.args = parsedArgs;
  console.log(global.args);
};
