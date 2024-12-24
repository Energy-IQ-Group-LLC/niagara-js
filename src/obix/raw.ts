import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { stripPaths } from '../helpers';

export class RawRequestInstance {
  axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  async post({ path, payload }: { path: string; payload: any }, axiosConfig?: AxiosRequestConfig) {
    path = stripPaths(path)[0];
    const { data } = await this.axiosInstance.post(path, payload, axiosConfig);
    return { data, path, action: 'rawPost' };
  }

  async get({ path }: { path: string }, axiosConfig?: AxiosRequestConfig) {
    path = stripPaths(path)[0];
    const { data } = await this.axiosInstance.get(path, axiosConfig);
    return { data, path, action: 'rawGet' };
  }
}
