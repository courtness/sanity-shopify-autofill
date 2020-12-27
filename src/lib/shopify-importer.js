import axios from "axios";
import { promises as fs } from "fs";

//

const getURL = () => {
  let config = {
    version: `2020-07`
  };

  process.argv.forEach((arg) => {
    const argSplit = arg.split(`=`);
    const key = argSplit[0];
    const value = argSplit[1];

    config[key.toLowerCase()] = value;
  });

  if (!config?.key || !config?.password || !config?.store) {
    console.error(`Required config params missing`);
    return null;
  } else {
    return `https://${config.key}:${config.password}@${config.store}.myshopify.com/admin/api/${config.version}/products.json?limit=250`;
  }
};

//

export const getShopifyProducts = (url) => {
  if (!url) {
    url = getURL();
  }

  if (!url) {
    console.error(`URL is undefined`);
    return;
  }

  // TODO : if cacheFile and !reload, return contents
  const cacheFile = `${global.importDirectory}/shopify-products.json`;

  //

  return new Promise((resolve, reject) => {
    axios.get(url).then(({ data }) => {
      const writeableData = JSON.stringify(data, null, 2);

      (async () => {
        try {
          await fs.writeFile(cacheFile, writeableData, (err) => {
            if (err) {
              throw err;
            }
          });
        } catch (e) {
          reject(e);
        }

        resolve(data);
      })();
    });
  });
};

export default getShopifyProducts;
