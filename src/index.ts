import { Cookie } from 'tough-cookie';
import { createBQLAxiosInstance, createObixAxiosInstance } from './axios.js';
// BQL Imports
import { BQLQueryInstance } from './bql/query.js';
// Obix Imports
import { URL } from 'url';
import { HistoryRequestInstance, PRESET_OPTIONS } from './obix/history.js';
import { StandardRequestInstance } from './obix/standard.js';
import { WatcherRequestInstance } from './obix/watcher.js';
import { AxiosInstanceConfig } from './types/axios.js';

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

  const historyRequestInstance = new HistoryRequestInstance(axiosInstance);
  const standardRequestInstance = new StandardRequestInstance(axiosInstance);
  const watcherRequestInstance = new WatcherRequestInstance(axiosInstance);

  return {
    axiosInstance,
    batchUrl: new URL(`${axiosInstance.defaults.baseURL}config`),
    batch: standardRequestInstance.batch.bind(standardRequestInstance),
    history: historyRequestInstance.historyRequest.bind(historyRequestInstance),
    historyPresetOptions: PRESET_OPTIONS,
    historyRollup: historyRequestInstance.rollupRequest.bind(historyRequestInstance),
    about: standardRequestInstance.about.bind(standardRequestInstance),
    getUnit: standardRequestInstance.getUnit.bind(standardRequestInstance),
    read: standardRequestInstance.read.bind(standardRequestInstance),
    invoke: standardRequestInstance.invoke.bind(standardRequestInstance),
    write: standardRequestInstance.write.bind(standardRequestInstance),
    watcherCreate: watcherRequestInstance.watcherCreate.bind(watcherRequestInstance),
    watcherUpdateDefaultLease: watcherRequestInstance.watcherUpdateDefaultLease.bind(watcherRequestInstance),
  };
}
