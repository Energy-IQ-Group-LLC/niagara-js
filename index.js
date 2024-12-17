import { createBQLAxiosInstance, createObixAxiosInstance } from './src/axios.js';
// BQL Imports
import { BQLQueryInstance } from './src/bql/query.js';
// Obix Imports
import { BatchRequestInstance } from './src/obix/batch.js';
import { HistoryRequestInstance } from './src/obix/history.js';
import { RawRequestInstance } from './src/obix/raw.js';
import { StandardRequestInstance } from './src/obix/standard.js';
import { WatcherRequestInstance } from './src/obix/watcher.js';

export class NiagaraConnector {
  /**
   * @constructor
   * @param {AxiosInstanceConfig} axiosInstanceConfig
   */
  constructor(axiosInstanceConfig) {
    this.bql = generateBQLFunctions(axiosInstanceConfig);
    this.obix = generateObixFunctions(axiosInstanceConfig);
  }

  /**
   * @param {string | import("tough-cookie").Cookie} sessionCookie
   */
  updateSessionCookie(sessionCookie) {
    if (this.bql.axiosInstance.defaults.baseURL) {
      this.bql.axiosInstance.cookieJar?.setCookieSync(sessionCookie, this.bql.axiosInstance.defaults.baseURL);
    }
    if (this.obix.axiosInstance.defaults.baseURL) {
      this.obix.axiosInstance.cookieJar?.setCookieSync(sessionCookie, this.obix.axiosInstance.defaults.baseURL);
    }
  }
}

/**
 * @param {AxiosInstanceConfig} axiosInstanceConfig
 */
function generateBQLFunctions(axiosInstanceConfig) {
  const axiosInstance = createBQLAxiosInstance(axiosInstanceConfig);

  const bqlQueryInstance = new BQLQueryInstance(axiosInstance);

  return {
    axiosInstance,
    query: bqlQueryInstance.bqlQuery.bind(bqlQueryInstance),
  };
}

/**
 * @param {AxiosInstanceConfig} axiosInstanceConfig
 */
function generateObixFunctions(axiosInstanceConfig) {
  const axiosInstance = createObixAxiosInstance(axiosInstanceConfig);

  const batchRequestInstance = new BatchRequestInstance(axiosInstance);
  const historyRequestInstance = new HistoryRequestInstance(axiosInstance);
  const rawRequestInstance = new RawRequestInstance(axiosInstance);
  const standardRequestInstance = new StandardRequestInstance(axiosInstance);
  const watcherRequestInstance = new WatcherRequestInstance(axiosInstance);

  return {
    axiosInstance,
    batch: batchRequestInstance.batchRequest.bind(batchRequestInstance),
    history: historyRequestInstance.historyRequest.bind(historyRequestInstance),
    get: rawRequestInstance.get.bind(rawRequestInstance),
    post: rawRequestInstance.post.bind(rawRequestInstance),
    read: standardRequestInstance.readRequest.bind(standardRequestInstance),
    write: standardRequestInstance.writeRequest.bind(standardRequestInstance),
    watcherCreate: watcherRequestInstance.watcherCreate.bind(watcherRequestInstance),
    watcherUpdateDefaultLease: watcherRequestInstance.watcherUpdateDefaultLease.bind(watcherRequestInstance),
  };
}
