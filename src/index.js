"use strict";

import { setFileSystem, storeArgs } from "~src/utils";
import SanityAPI from "~src/lib/SanityAPI";
import ShopifyAPI from "~src/lib/ShopifyAPI";

global.dirname = __dirname;

/**
 * -----------------------------------------------------------------------------
 * Fetch product data from the Shopify API and cache a Sanity-compatible JSON.
 * @return {null}
 */
const autofill = ({
  sanityDataset,
  sanityProjectId,
  sanityToken,
  shopifyKey,
  shopifyPassword,
  shopifyStore
}) => {
  const sanity = new SanityAPI({
    dataset: sanityDataset,
    projectId: sanityProjectId,
    token: sanityToken
  });
  const shopify = new ShopifyAPI({
    key: shopifyKey,
    password: shopifyPassword,
    store: shopifyStore
  });

  if (!sanity.valid()) {
    throw new Error(`Sanity credentials are unset`);
  }

  if (!shopify.valid()) {
    throw new Error(`Shopify credentials are unset`);
  }

  try {
    shopify
      .import()
      .then((products) => {
        sanity.transform(products).then((documents) => {
          sanity.upload(documents).then(() => {
            console.log(`[info] Complete`);
          });
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
