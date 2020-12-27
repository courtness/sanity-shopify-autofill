import axios from "axios";
import fs from "fs";

//

export const getURL = () => {
  let config = {
    version: `2020-07`
  };

  process.argv.forEach((arg) => {
    const argSplit = arg.split(`=`);
    const key = argSplit[0];
    const value = argSplit[1];

    config[key.toLowerCase()] = value;
  });

  if (!config.key || !config.password || !config.store) {
    console.error(`Required config params missing`);
    return null;
  } else {
    return `https://${config.key}:${config.password}@${config.store}.myshopify.com/admin/api/${config.version}/products.json?limit=250`;
  }
};

//

export const getProducts = (url) => {
  if (!url) {
    url = getURL();
  }

  if (!url) {
    console.error(`URL is undefined`);
    return;
  }

  async function getProductsJSON() {
    const products = await axios.get(url).then((response) => {
      return response.data;
    });

    return products;
  }

  getProductsJSON().then((products) => {
    fs.writeFile(
      `${globals.importDirectory}/shopify-products.json`,
      JSON.stringify(products, null, 2),
      (error) => {
        if (error) {
          console.error(error);
        }
      }
    );
  });
};
