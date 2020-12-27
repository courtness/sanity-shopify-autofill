import fs from "fs";

const preflight = () => {
  global.cacheDirectory = `${global.dirname}/.cache`;
  global.importDirectory = `${global.cacheDirectory}/import`;
  global.exportDirectory = `${global.cacheDirectory}/export`;

  const directories = [
    global.cacheDirectory,
    global.importDirectory,
    global.exportDirectory
  ];

  //

  directories.forEach((directory) => {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
  });
};

export default preflight;
