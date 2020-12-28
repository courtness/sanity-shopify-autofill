import axios from "axios";
import { promises as fs } from "fs";
import { getBaseShopifyURL, getShopifyPagesize } from "~src/utils";

// todo : if cacheFile exists and reload is not set, return the cachefile instead

//##############################################################################
// classes

/**
 *  @class PaginatedProducts
 *  @type {Object}
 *  @property {string} nextURL Authenticated pagination URL.
 *  @property {array} products Shopify products from products.json.
 */
const PaginatedProducts = ({ nextURL, products }) => {
  return {
    nextURL,
    products
  };
};

//##############################################################################
// methods

/**
 * -----------------------------------------------------------------------------
 * Fetch the products.json file from Shopify via supplied user auth credentials.
 * @return {Object} Shopify products.json file contents as JSON.
 */
const fetchProductsJSON = async (shopifyURL) => {
  const products = await axios.get(shopifyURL).then((response) => {
    return response;
  });

  return products;
};

/**
 * -----------------------------------------------------------------------------
 * Accept an Axios response object for Shopify pagination detection & assignment.
 * @return {PaginatedProducts} Pagination-enriched product data.
 */
const getPaginatedProducts = (response) => {
  const { data } = response;
  const { products } = data;

  console.log(`[info] Parsing ${products.length} products...`);

  let nextURL;

  if (response?.headers?.link?.includes(`rel="next"`)) {
    const shopifyHeaders = response.headers;
    const { link } = shopifyHeaders;

    const paginatedLink = link.substring(
      link.lastIndexOf(`<`) + 1,
      link.lastIndexOf(`>`)
    );

    const urlParams = new URLSearchParams(paginatedLink);
    const pageInfo = urlParams.get(`page_info`);

    nextURL = `${getBaseShopifyURL()}/products.json?limit=${getShopifyPagesize()}&page_info=${pageInfo}`;
  }

  return PaginatedProducts({
    nextURL,
    products
  });
};

//

/**
 * -----------------------------------------------------------------------------
 * Fetch products.json from Shopify and start the pagination loop, if required.
 * @return {Promise} Resolution return on pagination completion.
 */
export const importProducts = () => {
  return new Promise((resolve, reject) => {
    if (!getBaseShopifyURL()) {
      reject(`Shopify Base URL is not defined`);
    }

    const cacheFile = `${global.importDirectory}/shopify-products.json`;

    let shopifyProducts = [];

    //

    const loadPaginatedProducts = (paginatedURL) => {
      fetchProductsJSON(paginatedURL).then((response) => {
        const paginatedProducts = getPaginatedProducts(response);

        shopifyProducts = [...shopifyProducts, ...paginatedProducts.products];

        if (paginatedProducts?.nextURL) {
          console.log(`[info] Loading new page...`);

          loadPaginatedProducts(paginatedProducts.nextURL);
        } else {
          const writeableData = JSON.stringify(shopifyProducts, null, 2);

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

            resolve(shopifyProducts);
          })();
        }
      });
    };

    loadPaginatedProducts(
      `${getBaseShopifyURL()}/products.json?limit=${getShopifyPagesize()}`
    );
  });
};
