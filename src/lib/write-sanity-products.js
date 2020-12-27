import fs from "fs";

import { products } from "./import/shopify-products.json";

const sanityProducts = [];
const excludedHandles = [];

products.forEach((product, productIndex) => {
  if (excludedHandles.includes(product.handle)) {
    return;
  }

  //

  sanityProducts.push({
    _id: product.id.toString(),
    _type: `product`,
    title: product.title,
    handle: product.handle,
    description: product.body_html.replace(/<\/?[^>]+(>|$)/g, ``),
    image: {
      _type: `altImage`,
      _sanityAsset: `image@${product.image.src}`,
      altText: product.title
    }
  });
});

const dump = sanityProducts.map(JSON.stringify).join(`\n`);

fs.writeFile(`${__dirname}/.cache/export/dump.json`, dump, (err) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
});
