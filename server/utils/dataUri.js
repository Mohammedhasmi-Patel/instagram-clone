import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

const getDataUri = (file) => {
  const extName = path.extname(file.originalname).toString();
  const buffer = file.buffer;
  return parser.format(extName, buffer).content;
};

export default getDataUri;
