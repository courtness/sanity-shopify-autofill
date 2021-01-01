"use strict";

import { setFileSystem, storeArgs } from "~src/utils";
import { writeSanityDocuments } from "~src/lib/sanity-exporter.js";
// import SanityAPI from "~src/lib/SanityAPI";
import ShopifyAPI from "~src/lib/ShopifyAPI";

global.dirname = __dirname;

/**
 * -----------------------------------------------------------------------------
 * Fetch product data from the Shopify API and cache a Sanity-compatible JSON.
 * @return {null}
 */
const autofill = ({ shopifyKey, shopifyPassword, shopifyStore }) => {
  const shopify = new ShopifyAPI({
    key: shopifyKey,
    password: shopifyPassword,
    store: shopifyStore
  });

  //

  try {
    shopify
      .import()
      .then((shopifyProducts) => {
        console.log(
          `[info] Imported ${shopifyProducts.length} Shopify products.`
        );

        writeSanityDocuments(shopifyProducts).then((sanityData) => {
          console.log(`Sanity Complete: `, sanityData.length);
        });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.error(`\n[error] Shopify import failed: ${err}`);
  }
};

exports.autofill = autofill;

/**
 * -----------------------------------------------------------------------------
 * Default entry point with optional CLI argument parsing.
 * @return {null}
 */
const main = () => {
  storeArgs();

  try {
    setFileSystem();
  } catch (e) {
    console.error(
      `[error] Error caught trying to create file directories: ${err}`
    );
    return;
  }

  if (global?.args?.mode === `cli`) {
    if (
      !global?.args?.[`shopify-key`] ||
      !global?.args?.[`shopify-password`] ||
      !global?.args?.[`shopify-store`]
    ) {
      console.error(`\n[error] Required arguments unset.\n`);
      return;
    }

    autofill({
      shopifyKey: global.args[`shopify-key`],
      shopifyPassword: global.args[`shopify-password`],
      shopifyStore: global.args[`shopify-store`]
    });
  }
};

main();
