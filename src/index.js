"use strict";

exports.__esModule = true;

import fs from "fs";
import path from "path";
import { getProducts } from "~src/lib/read-shopify-products.js";

//

global.dirname = __dirname;
global.cacheDirectory = `${global.dirname}/.cache`;
global.importDirectory = `${global.cacheDirectory}/import`;
global.exportDirectory = `${global.cacheDirectory}/export`;

const directories = [
  global.cacheDirectory,
  global.importDirectory,
  global.exportDirectory
];

const createDirectories = () => {
  directories.forEach((directory) => {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
  });
};

const autofill = () => {
  createDirectories();

  console.log(`Autofill`);

  getProducts();
};

exports.autofill = autofill;

autofill();
