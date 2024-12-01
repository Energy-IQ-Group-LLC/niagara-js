import axios from 'axios';
import https from 'https';
import { CookieJar } from 'tough-cookie';
import { xml2js } from 'xml-js';
import { BQLHTTPError, HTTPError } from './errors.js';
import { parseError } from './parsers/errors.js';

/**
 * @param {import('../app.js').AxiosInstanceConfig} instanceConfig - The configuration for creating the Axios instance.
 */
export function createObixInstance(instanceConfig) {
  const axiosInstance = createDefaultAxiosInstance(instanceConfig);

  axiosInstance.defaults.transformResponse = [
    function (data) {
      try {
        return xml2js(data, { compact: true });
      } catch (error) {
        return data;
      }
    },
  ];

  axiosInstance.interceptors.response.use(
    (response) => {
      parseError(response.data?.err);
      return response;
    },
    (error) => {
      throw new HTTPError(error);
    }
  );

  return axiosInstance;
}

/**
 * @param {import('../app.js').AxiosInstanceConfig} instanceConfig - The configuration for creating the Axios instance.
 */
export function createBQLInstance(instanceConfig) {
  const axiosInstance = createDefaultAxiosInstance(instanceConfig);

  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      throw new BQLHTTPError(error);
    }
  );

  return axiosInstance;
}

/**
 * @param {import('../app.js').AxiosInstanceConfig} instance - The configuration for creating the Axios instance.
 */
function createDefaultAxiosInstance({ url, username, password, sessionCookie, timeout = 5000 }) {
  const axiosInstance = axios.create({
    baseURL: url,
    timeout,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });

  const cookieJar = new CookieJar();
  axiosInstance.cookieJar = cookieJar;

  if (sessionCookie) cookieJar.setCookieSync(sessionCookie, url);
  if (username && password) axiosInstance.defaults.auth = { username, password };

  configureCookieInterceptors(axiosInstance);

  return axiosInstance;
}

/**
 * @param {import('axios').AxiosInstance} axiosInstance
 */
function configureCookieInterceptors(axiosInstance) {
  const cookieJar = axiosInstance.cookieJar;

  axiosInstance.interceptors.response.use((response) => {
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      setCookieHeader.forEach((cookie) => {
        if (response.config.baseURL) cookieJar?.setCookieSync(cookie, response.config.baseURL);
      });
    }
    return response;
  });

  axiosInstance.interceptors.request.use((request) => {
    if (request.baseURL) request.headers.Cookie = cookieJar?.getCookieStringSync(request.baseURL);
    return request;
  });
}
