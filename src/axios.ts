import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import https from 'https';
import { CookieJar } from 'tough-cookie';
import { BQLHTTPError, HTTPError } from './errors.js';
import { stripTrailingSlash } from './helpers.js';
import { parseError } from './obix/parsers/errors.js';

const parser = new XMLParser({
  allowBooleanAttributes: true,
  attributeNamePrefix: '',
  attributesGroupName: 'attributes',
  ignoreAttributes: ['xmlns', 'xsi:schemaLocation', 'xmlns:xsi'],
  ignoreDeclaration: true,
  ignorePiTags: true,
  parseAttributeValue: true,
  processEntities: false,
  isArray: (name, jpath, isLeafNode, isAttribute) => {
    if (isAttribute) return false;
    else return true;
  },
});

export function createObixAxiosInstance(instanceConfig: AxiosInstanceConfig) {
  const strippedUrl = stripTrailingSlash(instanceConfig.url);
  const axiosInstance = createDefaultAxiosInstance({ ...instanceConfig, url: `${strippedUrl}/obix/` });

  axiosInstance.interceptors.response.use(
    // Any status code that lie within the range of 2xx cause this function to trigger
    (response) => {
      const parsedXml = parser.parse(response.data) as ObixElementRoot;
      if (parsedXml.err) {
        throw parseError(parsedXml.err[0]);
      }
      response.data = parsedXml;
      return response;
    },
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    (error) => {
      throw new HTTPError(error);
    }
  );

  return axiosInstance;
}

export function createBQLAxiosInstance(instanceConfig: AxiosInstanceConfig) {
  const axiosInstance = createDefaultAxiosInstance(instanceConfig);

  axiosInstance.interceptors.response.use(
    (response) => {
      if (typeof response.data == 'string' && response.data.includes('login/loginN4.js')) {
        throw new Error('Not Authorized');
      }
      return response;
    },
    (error) => {
      throw new BQLHTTPError(error);
    }
  );

  return axiosInstance;
}

function createDefaultAxiosInstance({ url, username, password, sessionCookie, timeout = 5000 }: AxiosInstanceConfig) {
  const axiosInstance = axios.create({
    baseURL: url,
    timeout,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });

  const cookieJar = new CookieJar();
  axiosInstance.cookieJar = cookieJar;

  if (sessionCookie) cookieJar.setCookieSync(sessionCookie, url);
  if (username && password) axiosInstance.defaults.auth = { username, password };

  //#region Set up cookie interceptors
  axiosInstance.interceptors.response.use((response) => {
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      setCookieHeader.forEach((cookie) => {
        if (response.config.baseURL) cookieJar.setCookieSync(cookie, response.config.baseURL);
      });
    }
    return response;
  });

  axiosInstance.interceptors.request.use((request) => {
    if (request.baseURL) request.headers.Cookie = cookieJar.getCookieStringSync(request.baseURL);
    return request;
  });
  //#endregion

  return axiosInstance;
}
