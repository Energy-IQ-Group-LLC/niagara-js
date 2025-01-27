import { InvalidTypeError, PathError } from './errors.js';
import { ObixAttributes, ObixElement, ObixElementRoot, ObixXmlFriendlyJSON } from './types/obix.js';

export function transformXMLParsedToFriendlyJSON(payload: ObixElementRoot) {
  // Recursive function to transform nodes
  function transformNode(node: ObixElementRoot) {
    const transformed: ObixXmlFriendlyJSON = {};
    const nodes: (typeof transformed)[] = [];

    // Iterate over the keys in the node
    Object.entries(node).forEach(([key, value]) => {
      const isAttribute = key.startsWith('$');
      if (isAttribute) {
        // Retain top-level properties starting with $
        transformed[key.slice(1)] = value;
      } else {
        const typedKey = key as keyof ObixAttributes.AttributeMapping[keyof ObixAttributes.AttributeMapping];
        // Add non-$ keys to the children array
        if (Array.isArray(value)) {
          value.forEach((item) => {
            nodes.push({ ...transformNode(item), type: typedKey });
          });
        } else if (typeof value === 'object') {
          nodes.push({ ...transformNode(value), type: typedKey });
        }
      }
    });

    // Add children only if there are any
    if (nodes.length > 0) {
      transformed.nodes = nodes;
    }

    return transformed;
  }

  // Start transformation from the root
  const transformedData = transformNode(payload);
  return transformedData.nodes?.[0];
}

export const stripPaths = (paths: string | string[]) => {
  const pathsArray = makeArray(paths);
  // Removes null and undefined values from array
  const pathsArrayFiltered = pathsArray.filter((p) => p);
  if (pathsArrayFiltered.length == 0) {
    throw new PathError('Missing Path');
  }
  return pathsArrayFiltered.map((p) => {
    p.charAt(p.length - 1) == '/' ? (p = p.slice(0, -1)) : null;
    p.charAt(0) == '/' ? (p = p.slice(1)) : null;
    return p;
  });
};

export const makeArray = <T>(data: T | T[]): T[] => {
  if (data) {
    return Array.isArray(data) ? data : [data];
  } else {
    return [];
  }
};

export function stripTrailingSlash(input: string) {
  return input.endsWith('/') ? input.slice(0, -1) : input;
}

export const parseError = (error: ObixElement<ObixAttributes.Err>) => {
  const errorDisplay = error?.$display;
  const errorReason = error?.$is;
  const errorHref = error?.$href;

  if (errorDisplay || errorReason) {
    if (errorReason?.includes('obix:BadUriErr') || errorDisplay?.includes('Path depth') || errorDisplay?.includes('Invalid name in path'))
      throw new PathError(errorDisplay || '', errorReason, errorHref);
    else if (errorDisplay?.includes('Invalid')) throw new InvalidTypeError();
    else throw new Error(errorDisplay || errorReason);
  }
};
