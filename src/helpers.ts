import { ATTRIBUTES_GROUP_NAME } from './constants.js';
import { InvalidTypeError, PathError } from './errors.js';
import { ObixAttributes, ObixElement } from './types/obix.js';

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
  const errorDisplay = error?.[ATTRIBUTES_GROUP_NAME]?.display;
  const errorReason = error?.[ATTRIBUTES_GROUP_NAME]?.is;
  const errorHref = error?.[ATTRIBUTES_GROUP_NAME]?.href;

  if (errorDisplay || errorReason) {
    if (errorReason?.includes('obix:BadUriErr') || errorDisplay?.includes('Path depth') || errorDisplay?.includes('Invalid name in path'))
      throw new PathError(errorDisplay || '', errorReason, errorHref);
    else if (errorDisplay?.includes('Invalid')) throw new InvalidTypeError();
    else throw new Error(errorDisplay || errorReason);
  }
};
