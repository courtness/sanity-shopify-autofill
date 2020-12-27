import { promises as fs } from "fs";

export const writeSanityDocuments = (shopifyProducts) => {
  const excludedHandles = [];
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
      _id: shopifyProduct.id.toString(),
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
