import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { UnknownTypeError } from '../errors.js';
import { replaceSpecialChars, stripPaths } from '../helpers.js';
import { buildOutputList } from './parsers/values.js';

export class WatcherRequestInstance {
  axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  async watcherUpdateDefaultLease(leaseTime: string | number, axiosConfig?: AxiosRequestConfig) {
    await this.axiosInstance.put('/watchService/defaultLeaseTime/', this.#buildLeaseBody(leaseTime), axiosConfig);
  }

  async watcherCreate(axiosConfig?: AxiosRequestConfig) {
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

  async #watcherAdd(endpoint: string, paths: string | string[], axiosConfig?: AxiosRequestConfig) {
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

  async #watcherRemovePath(endpoint: string, paths: string | string[], axiosConfig?: AxiosRequestConfig) {
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

  async #watcherDelete(endpoint: string, axiosConfig?: AxiosRequestConfig) {
    await this.axiosInstance.post(endpoint, undefined, axiosConfig);
    return;
  }

  async #watcherPollChanges(endpoint: string, axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axiosInstance.post(endpoint, undefined, axiosConfig);
    return this.#buildOutputList(data);
  }

  async #watcherPollRefresh(endpoint: string, axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axiosInstance.post(endpoint, undefined, axiosConfig);
    return this.#buildOutputList(data);
  }

  async #watcherUpdateLease(endpoint: string, leaseTime: string | number, axiosConfig?: AxiosRequestConfig) {
    await this.axiosInstance.put(endpoint, this.#buildLeaseBody(leaseTime), axiosConfig);
    return;
  }

  #findAttributeByName(dataArray: any[], name: string) {
    return dataArray.find((d) => d._attributes.name == name)?._attributes;
  }

  #buildLeaseBody(leaseTime: string | number) {
    if (Number.isInteger(Number(leaseTime))) {
      return `<real val="${Number(leaseTime)}" />`;
    } else if (typeof leaseTime == 'string') {
      return `<reltime val="${leaseTime}" />`;
    } else {
      throw new UnknownTypeError();
    }
  }

  #buildOutputList(data: any) {
    return buildOutputList(data).map((v) => ({ ...v, action: 'read' }));
  }
}
