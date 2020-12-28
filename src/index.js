"use strict";

exports.__esModule = true;

import { setFileSystem, setShopify } from "~src/utils";
import { writeSanityDocuments } from "~src/lib/sanity-exporter.js";
import { importProducts } from "~src/lib/shopify-importer.js";

global.dirname = __dirname;

/**
 * -----------------------------------------------------------------------------
 * Fetch product data from Shopify API and load them into Sanity as documents.
 * @return {null}
 */
const autofill = () => {
  setFileSystem();
  setShopify();

  if (!global?.shopifyBaseURL) {
    console.error(`[err]  Shopify base URL unset, aborting`);
    return;
  }

  importProducts()
    .then((shopifyProducts) => {
      console.log(
        `[info] Imported ${shopifyProducts.length} Shopify products.`
      );

      writeSanityDocuments(shopifyProducts).then((sanityData) => {
        console.log(`Sanity Complete: `, sanityData.length);
      });
    })
    .catch((err) => {
      console.error(`[err]  Failed to import Shopify products: ${err}`);
    });
};

exports.autofill = autofill;

autofill();
