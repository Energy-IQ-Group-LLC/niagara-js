import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { replaceSpecialChars, stripPaths } from '../helpers';
import { parseValueType } from './parsers/values';

export class StandardRequestInstance {
  axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  async writeRequest({ path, value }: { path: string; value: string | number | boolean }, axiosConfig?: AxiosRequestConfig) {
    path = stripPaths(path)[0];
    const { data } = await this.axiosInstance.post(`config/${path}/set/`, `<real val="${replaceSpecialChars(value)}"/>`, axiosConfig);
    return { ...parseValueType(data), path, action: 'write' };
  }

  async readRequest({ path }: { path: string }, axiosConfig?: AxiosRequestConfig) {
    path = stripPaths(path)[0];
    const { data } = await this.axiosInstance.get(`config/${path}/out/`, axiosConfig);
    return { ...parseValueType(data), path, action: 'read' };
  }
}
