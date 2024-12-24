import axios from 'axios';
import https from 'https';
import { CookieJar } from 'tough-cookie';
import { xml2js } from 'xml-js';
import { BQLHTTPError, HTTPError } from './errors';
import { stripTrailingSlash } from './helpers';
import { parseError } from './obix/parsers/errors';

export function createObixAxiosInstance(instanceConfig: AxiosInstanceConfig) {
  const stripedUrl = stripTrailingSlash(instanceConfig.url);
  const axiosInstance = createDefaultAxiosInstance({ ...instanceConfig, url: `${stripedUrl}/obix/` });

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
