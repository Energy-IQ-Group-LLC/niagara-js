import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { PathError } from '../errors.js';
import { stripPaths } from '../helpers.js';
import { LeaseResponse, WatchDefinitionResponse, WatcherNullResponse, WatcherResponse, WatcherServiceResponse } from '../types/watcher.js';

// TODO: could make a map of paths to add values too so it can be easier to see the data returned.
// TODO: could also attach remove function to each instance of the path just so its easier to delete the path.

class Watcher {
  readonly watcherName: string;
  private axios: AxiosInstance;
  private baseUrl: string;

  constructor(watcherName: string, axios: AxiosInstance) {
    this.watcherName = watcherName;
    this.axios = axios;
    this.baseUrl = `${this.axios.defaults.baseURL!}watchService/${this.watcherName}/`;
  }

  async add(paths: string | string[], axiosConfig?: AxiosRequestConfig) {
    const strippedPaths = stripPaths(paths);

    const { data } = await this.axios.post<WatcherResponse>(
      `${this.baseUrl}add/`,
      `<obj is="obix:WatchIn">
        <list names="hrefs">
          ${strippedPaths.map((p) => `<uri val="/obix/config/${p}/" />`).join('\n')}
        </list>
      </obj>`,
      axiosConfig
    );

    return data.nodes[0].nodes ?? [];
  }

  async remove(paths: string | string[], axiosConfig?: AxiosRequestConfig) {
    const strippedPaths = stripPaths(paths);

    const { data } = await this.axios.post<WatcherNullResponse>(
      `${this.baseUrl}remove/`,
      `<obj is="obix:WatchIn">
        <list names="hrefs">
          ${strippedPaths.map((p) => `<uri val="/obix/config/${p}/" />`).join('\n')}
        </list>
      </obj>`,
      axiosConfig
    );

    return data;
  }

  async pollChanges(axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axios.post<WatcherResponse>(`${this.baseUrl}pollChanges/`, undefined, axiosConfig);
    return data.nodes[0].nodes ?? [];
  }

  async pollRefresh(axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axios.post<WatcherResponse>(`${this.baseUrl}pollRefresh/`, undefined, axiosConfig);
    return data.nodes[0].nodes ?? [];
  }

  async updateLease(leaseTime: string | number, axiosConfig?: AxiosRequestConfig) {
    const payload = typeof leaseTime === 'number' ? `<real val="${leaseTime}" />` : `<reltime val="${leaseTime}" />`;
    const { data } = await this.axios.put<LeaseResponse>(`${this.baseUrl}lease/`, payload, axiosConfig);
    return data;
  }

  async delete(axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axios.post<WatcherNullResponse>(`${this.baseUrl}delete/`, undefined, axiosConfig);
    return data;
  }
}

export class WatcherRequestInstance {
  private axios: AxiosInstance;
  watchers: Record<string, Watcher> = {};

  constructor(axios: AxiosInstance) {
    this.axios = axios;
  }

  createWatcherInstance(watcherName: string) {
    return new Watcher(watcherName, this.axios);
  }

  async createWatcher(axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axios.post<WatchDefinitionResponse>('/watchService/make', undefined, axiosConfig);
    return this.#createAndAssignWatcher(data);
  }

  async syncWatchers(axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axios.get<WatcherServiceResponse>('/watchService', axiosConfig);
    const activeWatchers = data.nodes.filter((node): node is Extract<typeof node, { is: 'obix:Watch' }> => 'is' in node && node.is === 'obix:Watch');
    this.watchers = {};
    await Promise.all(
      activeWatchers.map(async (node) => {
        const { data: def } = await this.axios.get<WatchDefinitionResponse>(`/watchService/${node.href}`, axiosConfig);
        this.#createAndAssignWatcher(def);
      })
    );
    return this.watchers;
  }

  #createAndAssignWatcher(def: WatchDefinitionResponse) {
    const watcherName = def.href.split('/').at(-2)!;
    const watcher = this.createWatcherInstance(watcherName);
    this.watchers[watcherName] = watcher;
    return watcher;
  }

  async deleteWatcher(watcherName: string, axiosConfig?: AxiosRequestConfig) {
    const watcher = this.watchers[watcherName];
    if (!watcher) return;

    try {
      await watcher.delete(axiosConfig);
    } catch (error) {
      if (error instanceof PathError) {
        console.log(`Watcher ${watcher.watcherName} already deleted.`);
      } else {
        throw error;
      }
    }
    delete this.watchers[watcherName];
  }

  async updateDefaultLease(leaseTime: string | number, axiosConfig?: AxiosRequestConfig) {
    const payload = typeof leaseTime == 'number' ? `<real val="${leaseTime}" />` : `<reltime val="${leaseTime}" />`;
    const { data } = await this.axios.put<LeaseResponse>('/watchService/defaultLeaseTime/', payload, axiosConfig);
    return data;
  }
}
