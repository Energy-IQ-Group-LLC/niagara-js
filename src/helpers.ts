import { PathError } from './errors';

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

export const replaceSpecialChars = (value: string | number | boolean) => {
  // https://stackoverflow.com/questions/1091945/what-characters-do-i-need-to-escape-in-xml-documents#:~:text=XML%20escape%20characters,the%20W3C%20Markup%20Validation%20Service.
  const specialChars = [
    // & must go first or it will replace the escape from the other symbols
    { symbol: '&', escape: '&amp;' },
    { symbol: '"', escape: '&quot;' },
    { symbol: "'", escape: '&apos;' },
    { symbol: '<', escape: '&lt;' },
    { symbol: '>', escape: '&gt;' },
  ];
  if (typeof value == 'string') {
    specialChars.forEach((sc) => {
      if (typeof value == 'string') value = value.replaceAll(sc.symbol, sc.escape);
    });
  }
  return value;
};

export function stripTrailingSlash(input: string) {
  return input.endsWith('/') ? input.slice(0, -1) : input;
}
