import { parseValueType } from '../parsers/values.js';
import { stripPaths, replaceSpecialChars } from '../helpers.js';

export class StandardRequestInstance {
  /** @param {import('axios').AxiosInstance} axiosInstance */
  constructor(axiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  /**
   * @param {Object} obj
   * @param {string} obj.path
   * @param {string | number | boolean} obj.value
   * @param {import('axios').AxiosRequestConfig} [axiosConfig]
   */
  async writeRequest({ path, value }, axiosConfig) {
    path = stripPaths(path)[0];
    const { data } = await this.axiosInstance.post(`config/${path}/set/`, `<real val="${replaceSpecialChars(value)}"/>`, axiosConfig);
    return { ...parseValueType(data), path, action: 'write' };
  }

  /**
   * @param {Object} obj
   * @param {string} obj.path
   * @param {import('axios').AxiosRequestConfig} [axiosConfig]
   */
  async readRequest({ path }, axiosConfig) {
    path = stripPaths(path)[0];
    const { data } = await this.axiosInstance.get(`config/${path}/out/`, axiosConfig);
    return { ...parseValueType(data), path, action: 'read' };
  }
}
