import { createBQLInstance, createObixInstance } from './src/axios.js';

// Obix Imports
import { RawRequestInstance } from './src/requests/raw.js';
import { HistoryRequestInstance } from './src/requests/history.js';
import { BatchRequestInstance } from './src/requests/batch.js';
import { StandardRequestInstance } from './src/requests/standard.js';
import { WatcherRequestInstance } from './src/requests/watcher.js';

// BQL Imports
import { BQLQueryInstance } from './src/requests/bql.js';

// export { digestAuthLogin } from './src/digestAuth.js';

class BaseClass {
  /**
   * @constructor
   * @param {import('./app.js').AxiosInstanceConfig} axiosInstanceConfig
   * @param {boolean} [isBQL]
   */
  constructor(axiosInstanceConfig, isBQL = false) {
    this.axiosInstance = isBQL ? createBQLInstance(axiosInstanceConfig) : createObixInstance(axiosInstanceConfig);
  }

  /**
   * @param {string} username
   * @param {string} password
   */
  updateCredentials(username, password) {
    this.axiosInstance.defaults.auth = { username, password };
  }
}

// export class ObixInstance extends BaseClass {
//   #historyRequestInstance;
//   #batchRequestInstance;
//   #standardRequestInstance;
//   #watcherRequestInstance;

//   /**
//    * @constructor
//    * @param {Object} config - The configuration object for initializing the instance.
//    * @param {string} config.url - The base URL for requests.
//    * @param {string} config.username - The username for authentication.
//    * @param {string} config.password - The password for authentication.
//    * @param {number} [config.timeout] - The request timeout in milliseconds.
//    */
//   constructor({ url, username, password, timeout }) {
//     super({ url, username, password, timeout, isBQL: false });
//     this.#historyRequestInstance = new HistoryRequestInstance(this.axiosInstance);
//     this.#batchRequestInstance = new BatchRequestInstance(this.axiosInstance);
//     this.#standardRequestInstance = new StandardRequestInstance(this.axiosInstance);
//     this.#watcherRequestInstance = new WatcherRequestInstance(this.axiosInstance);
//   }

//   async post(path, payload, axiosConfig) {
//     return this.#rawRequestInstance.post(path, payload);
//   }
//   async get(path, axiosConfig) {
//     return this.#rawRequestInstance.get(path);
//   }

//   async history(path, query, axiosConfig) {
//     return this.#historyRequestInstance.historyRequest(path, query);
//   }

//   async batch(batch, axiosConfig) {
//     return this.#batchRequestInstance.batchRequest(batch, axiosConfig);
//   }

//   /**
//    * @param {string} path
//    * @param {import('axios').AxiosRequestConfig} [axiosConfig]
//    */
//   async read(path, axiosConfig) {
//     return this.#standardRequestInstance.readRequest(path, axiosConfig);
//   }
//   /**
//    * @param {string} path
//    * @param {string} value
//    * @param {import('axios').AxiosRequestConfig} [axiosConfig]
//    */
//   async write(path, value, axiosConfig) {
//     return this.#standardRequestInstance.writeRequest(path, value, axiosConfig);
//   }

//   async watcherCreate() {
//     return this.#watcherRequestInstance.watcherCreate();
//   }
//   /**
//    * @param {string | number} leaseTime
//    * @param {import('axios').AxiosRequestConfig} [axiosConfig]
//    */
//   async watcherUpdateDefaultLease(leaseTime, axiosConfig) {
//     return this.#watcherRequestInstance.watcherUpdateDefaultLease(leaseTime, axiosConfig);
//   }
// }

export class BQLInstance extends BaseClass {
  #bqlQueryInstance;

  /**
   * @constructor
   * @param {import('@root/app.js').AxiosInstanceConfig} axiosInstanceConfig - The configuration object for initializing the instance.
   */
  constructor(axiosInstanceConfig) {
    super(axiosInstanceConfig, true);
    this.#bqlQueryInstance = new BQLQueryInstance(this.axiosInstance);
  }

  /**
   * @param {Object} obj
   * @param {string} obj.query
   * @param {import('axios').AxiosRequestConfig} [axiosConfig]
   */
  async query({ query }, axiosConfig) {
    return this.#bqlQueryInstance.bqlQuery({ query }, axiosConfig);
  }
}
