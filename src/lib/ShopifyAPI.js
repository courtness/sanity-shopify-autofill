import axios from "axios";
import { promises as fs } from "fs";

/**
 *  @class ShopifyCataloguePage
 *  @type {Object}
 *  @property {string} nextURL Authenticated pagination URL
 *  @property {array} products Shopify products from products.json
 */
class ShopifyCataloguePage {
  constructor({ nextURL, products }) {
    this.nextURL = nextURL;
    this.products = products;
  }
}

/**
 *  @class ShopifyAPI
 *  @type {Object}
 *  @property {string} key Shopify API key
 *  @property {string} password Shopify API password
 *  @property {string} store Shopify Store name
 *  @property {int} pagesize Shopify page size (default: 100)
 *  @property {string} version Shopify API version (default: 2020-07)
 */
class ShopifyAPI {
  constructor({ key, password, store, pagesize = 100, version = `2020-07` }) {
    this.key = key;
    this.password = password;
    this.store = store;
    this.pagesize = pagesize;
    this.version = version;
  }

  /**
   * -----------------------------------------------------------------------------
   * Return a URL formatted with user-supplied Shopify credentials.
   * @return {string} An authenticated Shopify API URL.
   */
  url = () => {
    if (!this.valid()) {
      throw new Error(`Required credentials unset`);
    }

    return `https://${this.key}:${this.password}@${this.store}.myshopify.com/admin/api/${this.version}`;
  };

  /**
   * -----------------------------------------------------------------------------
   * Determine whether an instantiated object can be used for API requests.
   * @return {boolean} Validity of the class instance
   */
  valid = () => {
    return (
      this.key && this.password && this.store && this.pagesize && this.version
    );
  };

  /**
   * -----------------------------------------------------------------------------
   * Fetch products.json from Shopify and start the pagination loop, if required.
   * @return {Promise} Resolution return on pagination completion.
   */
  import = () => {
    if (!this.valid()) {
      throw new Error(`Required Shopify configuration missing`);
    }

    const url = this.url();

    return new Promise((resolve, reject) => {
      const cacheFile = `${global.importDirectory}/shopify-products.json`;

      let shopifyProducts = [];

      //
      // Asynchronous product fetcher
      const fetchProductsJSON = async (shopifyURL) => {
        const products = await axios.get(shopifyURL).then((response) => {
          return response;
        });

        return products;
      };

      //
      // Axios response-to-class parsing
      const getCataloguePage = (response) => {
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

          nextURL = `${this.url()}/products.json?limit=${
            this.pagesize
          }&page_info=${pageInfo}`;
        }

        return new ShopifyCataloguePage({
          nextURL,
          products
        });
      };

      //
      // Orchestrator
      const loadProductsFromURL = (paginatedURL) => {
        fetchProductsJSON(paginatedURL).then((response) => {
          const cataloguePage = getCataloguePage(response);

          shopifyProducts = [...shopifyProducts, ...cataloguePage.products];

          if (cataloguePage?.nextURL) {
            console.log(`[info] Loading new page...`);

            loadProductsFromURL(cataloguePage.nextURL);
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

      //
      // Orchestrator entry point
      loadProductsFromURL(`${url}/products.json?limit=${this.pagesize}`);
    });
  };
}

export default ShopifyAPI;
