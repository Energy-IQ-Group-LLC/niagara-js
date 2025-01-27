import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { stripPaths } from '../helpers.js';
import { ObixXmlFriendlyJSON } from '../types/obix.js';
import { ObixAbout, ObixUnit } from '../types/standard.js';

export class StandardRequestInstance {
  axiosInstance: AxiosInstance;
  unitCache: Map<string, ObixUnit>;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
    this.unitCache = new Map();
  }

  async about(axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axiosInstance.get<ObixAbout>(`about/`, axiosConfig);
    return data;
  }

  /**
   * @param obj
   * @param obj.obixNSUnit - string that includes the obix namespace and unit : ex. "obix:units/percent"
   * @param obj.unitName - string that just includes the unit name : ex. "percent"
   */
  async getUnit(
    { obixNSUnit, unitName }: { obixNSUnit: string; unitName?: string } | { obixNSUnit?: string; unitName: string },
    axiosConfig?: AxiosRequestConfig
  ) {
    const unit = obixNSUnit?.split('/').pop() || unitName;
    if (!unit) return null;

    const cachedUnit = this.unitCache.get(unit);
    if (cachedUnit) {
      return cachedUnit;
    } else {
      const { data } = await this.axiosInstance.get<ObixUnit>(`units/${unit}/`, axiosConfig);
      this.unitCache.set(unit, data);
      return data;
    }
  }

  async read<T = ObixXmlFriendlyJSON>({ path }: { path: string }, axiosConfig?: AxiosRequestConfig) {
    const strippedPath = stripPaths(path)[0];
    const { data } = await this.axiosInstance.get<T>(`config/${strippedPath}/`, axiosConfig);
    return data;
  }

  async invoke<T = ObixXmlFriendlyJSON>({ path, payload }: { path: string; payload?: string }, axiosConfig?: AxiosRequestConfig) {
    const strippedPath = stripPaths(path)[0];
    const { data } = await this.axiosInstance.post<T>(`config/${strippedPath}/`, payload, axiosConfig);
    return data;
  }

  async write<T = ObixXmlFriendlyJSON>({ path, payload }: { path: string; payload: string }, axiosConfig?: AxiosRequestConfig) {
    const strippedPath = stripPaths(path)[0];
    const { data } = await this.axiosInstance.post<T>(`config/${strippedPath}/`, payload, axiosConfig);
    return data;
  }

  async batch<T = ObixXmlFriendlyJSON>({ payload }: { payload: string }, axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axiosInstance.post<T>(`batch`, payload, axiosConfig);
    return data;
  }
}
