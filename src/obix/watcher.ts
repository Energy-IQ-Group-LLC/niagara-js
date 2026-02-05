import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { stripPaths } from '../helpers.js';
import { LeaseResponse, WatchDefinitionResponse, WatcherNullResponse, WatcherResponse, WatcherServiceResponse } from '../types/watcher.js';

// TODO: could make a map of paths to add values too so it can be easier to see the data returned.
// TODO: could also attach delete function to each instance of the path just so its easier to delete the path.

export class WatcherRequestInstance {
  axiosInstance: AxiosInstance;
  watchers: Record<string, Awaited<ReturnType<WatcherRequestInstance['watcherCreate']>>> = {};

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  createInstance(watcherName: string) {
    const watcherUrl = `${this.axiosInstance.defaults.baseURL!}watchService/${watcherName}/`;
    return {
      name: watcherName,
      add: this.#watcherAdd.bind(this, `${watcherUrl}add/`),
      remove: this.#watcherRemovePath.bind(this, `${watcherUrl}remove/`),
      pollChanges: this.#watcherPollChanges.bind(this, `${watcherUrl}pollChanges/`),
      pollRefresh: this.#watcherPollRefresh.bind(this, `${watcherUrl}pollRefresh/`),
      delete: this.#watcherDelete.bind(this, `${watcherUrl}delete/`, watcherName),
      lease: this.#watcherUpdateLease.bind(this, `${watcherUrl}lease/`),
    };
  }

  async watcherUpdateDefaultLease(leaseTime: string | number, axiosConfig?: AxiosRequestConfig) {
    const payload = typeof leaseTime == 'number' ? `<real val="${leaseTime}" />` : `<reltime val="${leaseTime}" />`;
    const { data } = await this.axiosInstance.put<LeaseResponse>('/watchService/defaultLeaseTime/', payload, axiosConfig);
    return data;
  }

  async watchersRefreshInstances(axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axiosInstance.get<WatcherServiceResponse>('/watchService', axiosConfig);
    const activeWatchers = data.nodes.filter((node): node is Extract<typeof node, { is: 'obix:Watch' }> => 'is' in node && node.is === 'obix:Watch');
    // Clear out all this.watchers
    this.watchers = {};
    await Promise.all(
      activeWatchers.map(async (watcher) => {
        const { data } = await this.axiosInstance.get<WatchDefinitionResponse>(`/watchService/${watcher.href}`, axiosConfig);
        this.#createAndAssignWatcherInstance(data);
      })
    );
    return this.watchers;
  }

  async watcherCreate(axiosConfig?: AxiosRequestConfig) {
    const { data: watchCreateData } = await this.axiosInstance.post<WatchDefinitionResponse>('/watchService/make', undefined, axiosConfig);
    return this.#createAndAssignWatcherInstance(watchCreateData);
  }

  #createAndAssignWatcherInstance(watcherDefinitionResponse: WatchDefinitionResponse) {
    const watcherName = watcherDefinitionResponse.href.split('/').at(-2) as string;
    const watcherInstance = this.createInstance(watcherName);
    this.watchers[watcherName] = watcherInstance;
    return watcherInstance;
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
    return data.nodes[0].nodes || [];
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

  async #watcherDelete(endpoint: string, watcherName: string, axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axiosInstance.post<WatcherNullResponse>(endpoint, undefined, axiosConfig);
    delete this.watchers[watcherName];
    return data;
  }

  async #watcherPollChanges(endpoint: string, axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axiosInstance.post<WatcherResponse>(endpoint, undefined, axiosConfig);
    return data.nodes[0].nodes || [];
  }

  async #watcherPollRefresh(endpoint: string, axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axiosInstance.post<WatcherResponse>(endpoint, undefined, axiosConfig);
    return data.nodes[0].nodes || [];
  }

  async #watcherUpdateLease(endpoint: string, leaseTime: string | number, axiosConfig?: AxiosRequestConfig) {
    const payload = typeof leaseTime == 'number' ? `<real val="${leaseTime}" />` : `<reltime val="${leaseTime}" />`;
    const { data } = await this.axiosInstance.put<LeaseResponse>(endpoint, payload, axiosConfig);
    return data;
  }
}
