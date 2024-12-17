import { PathError } from './errors.js';

/**
 * @param {string[] | string} paths
 */
export const stripPaths = (paths) => {
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

/**
 * Ensures the input is returned as an array.
 *
 * @template T
 * @param {T | T[]} data - The input value to be converted into an array.
 * @returns {T[]} An array containing the input value(s) or an empty array if the input is falsy.
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
