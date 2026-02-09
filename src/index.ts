import { CookieJar } from 'tough-cookie';
import { createBQLAxiosInstance, createObixAxiosInstance } from './axios.js';
// BQL Imports
import { BQLQueryInstance } from './bql/query.js';
// Obix Imports
import { URL } from 'url';
import { type AxiosInstanceConfig } from './axios.js';
import { HistoryRequestInstance, PRESET_OPTIONS } from './obix/history.js';
import { StandardRequestInstance } from './obix/standard.js';
import { WatcherRequestInstance } from './obix/watcher.js';

// Exports
export { type AxiosInstanceConfig } from './axios.js';
export * from './errors.js';
export * from './types/history.js';
export * from './types/obix.js';
export * from './types/query.js';
export * from './types/standard.js';
export * from './types/watcher.js';

export class NiagaraConnector {
  bql: ReturnType<typeof generateBQLFunctions>;
  obix: ReturnType<typeof generateObixFunctions>;
  #axiosInstanceConfig: AxiosInstanceConfig;

  constructor(axiosInstanceConfig: Omit<AxiosInstanceConfig, 'cookieJar'> & { cookieJar?: CookieJar }) {
    this.#axiosInstanceConfig = { ...axiosInstanceConfig, cookieJar: axiosInstanceConfig.cookieJar ?? new CookieJar() };
    this.bql = generateBQLFunctions(this.#axiosInstanceConfig);
    this.obix = generateObixFunctions(this.#axiosInstanceConfig);
  }

  get cookieJar(): CookieJar {
    return this.#axiosInstanceConfig.cookieJar;
  }

  get cookies(): NiagaraCookies {
    return Object.fromEntries(this.cookieJar.getCookiesSync(this.#axiosInstanceConfig.baseUrl).map((c) => [c.key, c.value]));
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
    watcher: watcherRequestInstance,
  };
}

export type NiagaraCookies = Record<string, string>;

export function createCookieJarFromCookies({ baseUrl, cookies }: { baseUrl: string; cookies: NiagaraCookies }): CookieJar {
  const jar = new CookieJar();
  for (const [k, v] of Object.entries(cookies)) {
    jar.setCookieSync(`${k}=${v}`, baseUrl);
  }
  return jar;
}
