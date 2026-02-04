import axios from 'axios';
import axiosRetry, { type IAxiosRetryConfig } from 'axios-retry';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';
import { CookieJar } from 'tough-cookie';
import { BQLHTTPError, HTTPError } from './errors.js';
import { parseError, stripTrailingSlash, transformXMLParsedToFriendlyJSON } from './helpers.js';
import { parser } from './obix/xml.js';
import { ObixElementRoot } from './types/obix.js';

declare module 'axios' {
  interface AxiosRequestConfig {
    jar?: CookieJar;
  }
}

export type AxiosInstanceConfig = {
  baseUrl: string;
  cookieJar: CookieJar;
  username?: string;
  password?: string;
  timeout?: number;
  axiosRetryConfig: IAxiosRetryConfig;
};

// TODO: refactor error handling

function createDefaultAxiosInstance({ baseUrl, cookieJar, username, password, timeout, axiosRetryConfig }: AxiosInstanceConfig) {
  const axiosInstance = axios.create({
    baseURL: baseUrl,
    timeout,
    jar: cookieJar,
    withCredentials: true,
    httpAgent: new HttpCookieAgent({ cookies: { jar: cookieJar }, keepAlive: true, maxSockets: 10, maxFreeSockets: 5 }),
    httpsAgent: new HttpsCookieAgent({
      cookies: { jar: cookieJar },
      rejectUnauthorized: false,
      keepAlive: true,
      maxSockets: 10,
      maxFreeSockets: 5,
    }),
    ...(username && { auth: { username, password: password || '' } }), // allows empty password
  });

  if (axiosRetryConfig) axiosRetry(axiosInstance, axiosRetryConfig);

  return axiosInstance;
}

export function createObixAxiosInstance(instanceConfig: AxiosInstanceConfig) {
  const strippedUrl = stripTrailingSlash(instanceConfig.baseUrl);
  const axiosInstance = createDefaultAxiosInstance({ ...instanceConfig, baseUrl: `${strippedUrl}/obix/` });

  axiosInstance.interceptors.response.use(
    // Any status code that lie within the range of 2xx cause this function to trigger
    (response) => {
      const parsedXml = parser.parse(response.data) as ObixElementRoot;
      if (parsedXml.err) {
        throw parseError(parsedXml.err[0]);
      }

      response.data = transformXMLParsedToFriendlyJSON(parsedXml);
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
