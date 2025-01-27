import { XMLParser } from 'fast-xml-parser';

export const parser = new XMLParser({
  allowBooleanAttributes: true,
  attributeNamePrefix: '$',
  attributeValueProcessor: (name, val, jPath) => {
    if (val === 'NULL' || val == 'null') return null;
    else return val;
  },
  ignoreAttributes: ['xmlns', 'xsi:schemaLocation', 'xmlns:xsi'],
  ignoreDeclaration: true,
  ignorePiTags: true,
  parseAttributeValue: true,
  htmlEntities: true,
  isArray: (name, jPath, isLeafNode, isAttribute) => {
    if (isAttribute) return false;
    else return true;
  },
});
