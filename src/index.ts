import { Cookie } from 'tough-cookie';
import { createBQLAxiosInstance, createObixAxiosInstance } from './axios.js';
// BQL Imports
import { BQLQueryInstance } from './bql/query.js';
// Obix Imports
import { BatchRequestInstance } from './obix/batch.js';
import { HistoryRequestInstance } from './obix/history.js';
import { RawRequestInstance } from './obix/raw.js';
import { StandardRequestInstance } from './obix/standard.js';
import { WatcherRequestInstance } from './obix/watcher.js';

export class NiagaraConnector {
  bql: ReturnType<typeof generateBQLFunctions>;
  obix: ReturnType<typeof generateObixFunctions>;

  constructor(axiosInstanceConfig: AxiosInstanceConfig) {
    this.bql = generateBQLFunctions(axiosInstanceConfig);
    this.obix = generateObixFunctions(axiosInstanceConfig);
  }

  updateSessionCookie(sessionCookie: string | Cookie) {
    if (this.bql.axiosInstance.defaults.baseURL) {
      this.bql.axiosInstance.cookieJar?.setCookieSync(sessionCookie, this.bql.axiosInstance.defaults.baseURL);
    }
    if (this.obix.axiosInstance.defaults.baseURL) {
      this.obix.axiosInstance.cookieJar?.setCookieSync(sessionCookie, this.obix.axiosInstance.defaults.baseURL);
    }
  }
}

function generateBQLFunctions(axiosInstanceConfig: AxiosInstanceConfig) {
  const axiosInstance = createBQLAxiosInstance(axiosInstanceConfig);

  const bqlQueryInstance = new BQLQueryInstance(axiosInstance);

  return {
    axiosInstance,
    query: bqlQueryInstance.bqlQuery.bind(bqlQueryInstance),
  };
}

function generateObixFunctions(axiosInstanceConfig: AxiosInstanceConfig) {
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
