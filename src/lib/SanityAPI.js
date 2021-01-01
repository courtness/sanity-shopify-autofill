import axios from "axios";
import { promises as fs } from "fs";
import sanityClient from "@sanity/client";

/**
 *  @class SanityAPI
 *  @type {Object}
 *  @property {string} projectId Sanity API Project ID
 *  @property {string} password Sanity API Dataset id (e.g. production)
 */
class SanityAPI {
  constructor({ projectId, dataset, token }) {
    this.client = sanityClient({
      dataset,
      projectId,
      token,
      useCdn: false
    });
  }

  /**
   * -----------------------------------------------------------------------------
   * Determine whether an instantiated object can be used for API requests.
   * @return {boolean} Validity of the class instance
   */
  valid = () => {
    return typeof this.client !== `undefined`;
  };

  /**
   * -----------------------------------------------------------------------------
   * Convert Shopify product data to a Sanity-compatible document JSON file.
   * @return {Promise} The completion state of the document cache operation
   */
  transform = (shopifyProducts, excludedHandles = []) => {
    const sanityDocuments = [];

    if (!shopifyProducts?.[0]) {
      console.error(
        `Shopify data did not contain a 'products' object. Aborting.`
      );
    }

    shopifyProducts.forEach((shopifyProduct) => {
      if (excludedHandles.includes(shopifyProduct.handle)) {
        return;
      }

      //

      sanityDocuments.push({
        _id: `shopify-import-${shopifyProduct.id.toString()}`,
        _type: `product`,
        title: shopifyProduct.title,
        handle: shopifyProduct.handle,
        description: shopifyProduct.body_html.replace(/<\/?[^>]+(>|$)/g, ``),
        image: {
          _type: `altImage`,
          _sanityAsset: `image@${shopifyProduct.image.src}`,
          altText: shopifyProduct.title
        }
      });
    });

    //

    const cacheFile = `${global.exportDirectory}/sanity-documents.json`;
    const writeableData = sanityDocuments.map(JSON.stringify).join(`\n`);

    return new Promise((resolve, reject) => {
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

        resolve(sanityDocuments);
      })();
    });
  };

  /**
   * -----------------------------------------------------------------------------
   * Upload the resulting documents to Sanity via credentials provided.
   * @return {null}
   */
  upload = (documents) => {
    if (!this.valid()) {
      throw new Error(`Sanity Client has not been instantiated`);
    }

    return Promise.all(
      documents.map((document) => this.client.createOrReplace(document))
    );
  };
}

export default SanityAPI;
