import { stripPaths } from '../helpers.js';

export class RawRequestInstance {
  /** @param {import('axios').AxiosInstance} axiosInstance */
  constructor(axiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  /**
   * @param {Object} obj
   * @param {string} obj.path
   * @param {*} obj.payload
   * @param {import('axios').AxiosRequestConfig} [axiosConfig]
   */
  async post({ path, payload }, axiosConfig) {
    path = stripPaths(path)[0];
    const { data } = await this.axiosInstance.post(path, payload, axiosConfig);
    return { data, path, action: 'rawPost' };
  }

  /**
   * @param {Object} obj
   * @param {string} obj.path
   * @param {import('axios').AxiosRequestConfig} [axiosConfig]
   */
  async get({ path }, axiosConfig) {
    path = stripPaths(path)[0];
    const { data } = await this.axiosInstance.get(path, axiosConfig);
    return { data, path, action: 'rawGet' };
  }
}
