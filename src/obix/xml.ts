import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { ATTRIBUTES_GROUP_NAME } from '../constants.js';

export const parser = new XMLParser({
  allowBooleanAttributes: true,
  attributeNamePrefix: '',
  attributesGroupName: ATTRIBUTES_GROUP_NAME,
  ignoreAttributes: ['xmlns', 'xsi:schemaLocation', 'xmlns:xsi'],
  ignoreDeclaration: true,
  ignorePiTags: true,
  parseAttributeValue: true,
  htmlEntities: true,
  isArray: (name, jPath, isLeafNode, isAttribute) => {
    console.log(name, jPath, isLeafNode, isAttribute);
    if (isAttribute) return false;
    else return true;
  },
});

export const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributesGroupName: ATTRIBUTES_GROUP_NAME,
});
