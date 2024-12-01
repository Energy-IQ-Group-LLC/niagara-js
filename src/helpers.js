import { PathError } from './errors.js';

/**
 * @param {string[] | string} paths
 */
export const stripPaths = (paths) => {
  paths = makeArray(paths);
  // Removes null and undefined values from array
  paths = paths.filter((p) => p);
  if (paths.length == 0) {
    throw new PathError('Missing Path');
  }
  paths = paths.map((p) => {
    p.charAt(p.length - 1) == '/' ? (p = p.slice(0, -1)) : null;
    p.charAt(0) == '/' ? (p = p.slice(1)) : null;
    return p;
  });
  return paths;
};

/**
 * @param {*} data
 */
export const makeArray = (data) => {
  if (data) {
    return Array.isArray(data) ? data : [data];
  } else {
    return [];
  }
};

/**
 * @param {string | number | boolean} value
 */
export const replaceSpecialChars = (value) => {
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

/**
 * Removes a trailing slash ('/') from the end of a string if it exists.
 * @param {string} input - The input string.
 * @returns {string} The input string without a trailing slash.
 */
export function stripTrailingSlash(input) {
  return input.endsWith('/') ? input.slice(0, -1) : input;
}
