import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { stripPaths } from '../helpers.js';
import { LeaseResponse, WatchCreateResponse, WatcherNullResponse, WatcherResponse } from '../types/watcher.js';

// TODO: could make a map of paths to add values too so it can be easier to see the data returned.
// TODO: could also attach delete function to each instance of the path just so its easier to delete the path.

export class WatcherRequestInstance {
  axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  async watcherUpdateDefaultLease(leaseTime: string | number, axiosConfig?: AxiosRequestConfig) {
    const payload = typeof leaseTime == 'number' ? `<real val="${leaseTime}" />` : `<reltime val="${leaseTime}" />`;
    const { data } = await this.axiosInstance.put<LeaseResponse>('/watchService/defaultLeaseTime/', payload, axiosConfig);
    return data;
  }

  async watcherCreate(axiosConfig?: AxiosRequestConfig) {
    const { data: watchCreateData } = await this.axiosInstance.post<WatchCreateResponse>('/watchService/make', undefined, axiosConfig);
    const watcherName = watchCreateData.href.split('/').at(-2);
    return {
      name: watcherName,
      add: this.#watcherAdd.bind(this, watchCreateData.nodes.find((node) => node.name == 'add')?.href ?? ''),
      remove: this.#watcherRemovePath.bind(this, watchCreateData.nodes.find((node) => node.name == 'remove')?.href ?? ''),
      pollChanges: this.#watcherPollChanges.bind(this, watchCreateData.nodes.find((node) => node.name == 'pollChanges')?.href ?? ''),
      pollRefresh: this.#watcherPollRefresh.bind(this, watchCreateData.nodes.find((node) => node.name == 'pollRefresh')?.href ?? ''),
      delete: this.#watcherDelete.bind(this, watchCreateData.nodes.find((node) => node.name == 'delete')?.href ?? ''),
      lease: this.#watcherUpdateLease.bind(this, watchCreateData.nodes.find((node) => node.name == 'lease')?.href ?? ''),
    };
  }

  async #watcherAdd(endpoint: string, paths: string | string[], axiosConfig?: AxiosRequestConfig) {
    const strippedPaths = stripPaths(paths);
    const { data } = await this.axiosInstance.post<WatcherResponse>(
      endpoint,
      `<obj is="obix:WatchIn">
          <list names="hrefs">
            ${strippedPaths.map((p) => `<uri val="/obix/config/${p}/" />`).join('\n')}
          </list>
        </obj>`,
      axiosConfig
    );
    return data.nodes[0].nodes;
  }

  async #watcherRemovePath(endpoint: string, paths: string | string[], axiosConfig?: AxiosRequestConfig) {
    const strippedPaths = stripPaths(paths);
    const { data } = await this.axiosInstance.post<WatcherNullResponse>(
      endpoint,
      `<obj is="obix:WatchIn">
          <list names="hrefs">
            ${strippedPaths.map((p) => `<uri val="/obix/config/${p}/" />`).join('\n')}
          </list>
        </obj>`,
      axiosConfig
    );
    return data;
  }

  async #watcherDelete(endpoint: string, axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axiosInstance.post<WatcherNullResponse>(endpoint, undefined, axiosConfig);
    return data;
  }

  async #watcherPollChanges(endpoint: string, axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axiosInstance.post<WatcherResponse>(endpoint, undefined, axiosConfig);
    return data.nodes[0].nodes;
  }

  async #watcherPollRefresh(endpoint: string, axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axiosInstance.post<WatcherResponse>(endpoint, undefined, axiosConfig);
    return data.nodes[0].nodes;
  }

  async #watcherUpdateLease(endpoint: string, leaseTime: string | number, axiosConfig?: AxiosRequestConfig) {
    const payload = typeof leaseTime == 'number' ? `<real val="${leaseTime}" />` : `<reltime val="${leaseTime}" />`;
    const { data } = await this.axiosInstance.put<LeaseResponse>(endpoint, payload, axiosConfig);
    return data;
  }
}
