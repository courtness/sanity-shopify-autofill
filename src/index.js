"use strict";

exports.__esModule = true;

import { setFileSystem, storeArgs } from "~src/utils";
import { writeSanityDocuments } from "~src/lib/sanity-exporter.js";
import { importProducts } from "~src/lib/shopify-importer.js";

global.dirname = __dirname;

/**
 * -----------------------------------------------------------------------------
 * Fetch product data from Shopify API and load them into Sanity as documents.
 * @return {null}
 */
const autofill = () => {
  storeArgs();
  setFileSystem();

  importProducts().then((shopifyProducts) => {
    console.log(`[info] Imported ${shopifyProducts.length} Shopify products.`);

    writeSanityDocuments(shopifyProducts).then((sanityData) => {
      console.log(`Sanity Complete: `, sanityData.length);
    });
  });
};

exports.autofill = autofill;

autofill();
