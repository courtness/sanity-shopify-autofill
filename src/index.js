"use strict";

exports.__esModule = true;

import preflight from "~src/preflight";
import { writeSanityDocuments } from "~src/lib/sanity-exporter.js";
import { getShopifyProducts } from "~src/lib/shopify-importer.js";

//

global.dirname = __dirname;

const autofill = () => {
  preflight();

  console.log(`Autofill`);

  getShopifyProducts().then((shopifyData) => {
    console.log(`Shopify Complete: `, shopifyData.products.length);

    writeSanityDocuments(shopifyData).then((sanityData) => {
      console.log(`Sanity Complete: `, sanityData.length);
    });
  });
};

exports.autofill = autofill;

autofill();
