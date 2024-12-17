import { stripPaths, replaceSpecialChars } from '../helpers.js';
import { buildOutputList } from './parsers/values.js';
import { UnknownTypeError } from '../errors.js';

export class WatcherRequestInstance {
  /** @param {import('axios').AxiosInstance} axiosInstance */
  constructor(axiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  /**
   * @param {Object} obj
   * @param {string | number} obj.leaseTime
   * @param {import('axios').AxiosRequestConfig} [axiosConfig]
   */
  async watcherUpdateDefaultLease({ leaseTime }, axiosConfig) {
    await this.axiosInstance.put('/watchService/defaultLeaseTime/', this.#buildLeaseBody(leaseTime), axiosConfig);
    return;
  }

  /**
   * @param {import('axios').AxiosRequestConfig} [axiosConfig]
   */
  async watcherCreate(axiosConfig) {
    const { data: watchCreateData } = await this.axiosInstance.post('/watchService/make', undefined, axiosConfig);
    const watcherName = watchCreateData.obj._attributes.href.split('/').at(-2);
    const watcherOperations = watchCreateData.obj.op;
    const findAtt = this.#findAttributeByName.bind(this, watcherOperations);
    return {
      name: watcherName,
      add: this.#watcherAdd.bind(this, findAtt('add')?.href),
      remove: this.#watcherRemovePath.bind(this, findAtt('remove')?.href),
      delete: this.#watcherDelete.bind(this, findAtt('delete')?.href),
      pollChanges: this.#watcherPollChanges.bind(this, findAtt('pollChanges')?.href),
      pollRefresh: this.#watcherPollRefresh.bind(this, findAtt('pollRefresh')?.href),
      lease: this.#watcherUpdateLease.bind(this, watchCreateData.obj.reltime._attributes.href),
    };
  }

  /**
   * @param {string} endpoint
   * @param {Object} obj
   * @param {string | string[]} obj.paths
   * @param {import('axios').AxiosRequestConfig} [axiosConfig]
   */
  async #watcherAdd(endpoint, { paths }, axiosConfig) {
    paths = stripPaths(paths);
    const { data } = await this.axiosInstance.post(
      endpoint,
      `<obj>
          <list>
            ${paths.map((p) => `<uri val="/obix/config/${replaceSpecialChars(p)}/" />`).join('\n')}
          </list>
        </obj>`,
      axiosConfig
    );
    return this.#buildOutputList(data);
  }

  /**
   * @param {string} endpoint
   * @param {Object} obj
   * @param {string | string[]} obj.paths
   * @param {import('axios').AxiosRequestConfig} [axiosConfig]
   */
  async #watcherRemovePath(endpoint, { paths }, axiosConfig) {
    paths = stripPaths(paths);
    await this.axiosInstance.post(
      endpoint,
      `<obj>
          <list>
            ${paths.map((p) => `<uri val="/obix/config/${replaceSpecialChars(p)}/" />`).join('\n')}
          </list>
        </obj>`,
      axiosConfig
    );
    return;
  }

  /**
   * @param {string} endpoint
   * @param {import('axios').AxiosRequestConfig} [axiosConfig]
   */
  async #watcherDelete(endpoint, axiosConfig) {
    await this.axiosInstance.post(endpoint, undefined, axiosConfig);
    return;
  }

  /**
   * @param {string} endpoint
   * @param {import('axios').AxiosRequestConfig} [axiosConfig]
   */
  async #watcherPollChanges(endpoint, axiosConfig) {
    const { data } = await this.axiosInstance.post(endpoint, undefined, axiosConfig);
    return this.#buildOutputList(data);
  }

  /**
   * @param {string} endpoint
   * @param {import('axios').AxiosRequestConfig} [axiosConfig]
   */
  async #watcherPollRefresh(endpoint, axiosConfig) {
    const { data } = await this.axiosInstance.post(endpoint, undefined, axiosConfig);
    return this.#buildOutputList(data);
  }

  /**
   * @param {string} endpoint
   * @param {Object} obj
   * @param {string | number} obj.leaseTime
   * @param {import('axios').AxiosRequestConfig} [axiosConfig]
   */
  async #watcherUpdateLease(endpoint, { leaseTime }, axiosConfig) {
    await this.axiosInstance.put(endpoint, this.#buildLeaseBody(leaseTime), axiosConfig);
    return;
  }

  /**
   * @param {any[]} dataArray
   * @param {string} name
   */
  #findAttributeByName(dataArray, name) {
    return dataArray.find((d) => d._attributes.name == name)?._attributes;
  }

  /**
   * @param {string | number} leaseTime
   */
  #buildLeaseBody(leaseTime) {
    if (Number.isInteger(Number(leaseTime))) {
      return `<real val="${Number(leaseTime)}" />`;
    } else if (typeof leaseTime == 'string') {
      return `<reltime val="${leaseTime}" />`;
    } else {
      throw new UnknownTypeError();
    }
  }

  /**
   * @param {any} data
   */
  #buildOutputList(data) {
    return buildOutputList(data).map((v) => ({ ...v, action: 'read' }));
  }
}
