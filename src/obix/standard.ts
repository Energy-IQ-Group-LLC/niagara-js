import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { stripPaths } from '../helpers.js';
import { ObixXmlFriendlyJSON } from '../types/obix.js';
import { ObixAbout, ObixUnit } from '../types/standard.js';

type ObixUnitMap = Map<string, Promise<ObixUnit | null>>;

const unitCacheByClient = new WeakMap<AxiosInstance, ObixUnitMap>();

function getUnitCache(axios: AxiosInstance): ObixUnitMap {
  let cache = unitCacheByClient.get(axios);
  if (!cache) {
    cache = new Map();
    unitCacheByClient.set(axios, cache);
  }
  return cache;
}

export class StandardRequestInstance {
  private axios: AxiosInstance;

  constructor(axios: AxiosInstance) {
    this.axios = axios;
  }

  async about(axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axios.get<ObixAbout>(`about/`, axiosConfig);
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
  ): Promise<ObixUnit | null> {
    const unit = obixNSUnit?.split('/').pop() || unitName;
    if (!unit) return null;

    const cache = getUnitCache(this.axios);

    // Cache the *Promise*, not the resolved value.
    // This ensures concurrent requests for the same unit share a single in-flight
    // request instead of triggering multiple network calls. Callers `await` the
    // cached Promise, which resolves once and is reused thereafter.
    let cached = cache.get(unit);
    if (!cached) {
      cached = this.axios
        .get<ObixUnit>(`units/${unit}/`, axiosConfig)
        .then(({ data }) => data)
        .catch(() => null);

      cache.set(unit, cached);
    }

    return cached;
  }

  async read<T = ObixXmlFriendlyJSON>({ path }: { path: string }, axiosConfig?: AxiosRequestConfig) {
    const strippedPath = stripPaths(path)[0];
    const { data } = await this.axios.get<T>(`config/${strippedPath}/`, axiosConfig);
    return data;
  }

  async invoke<T = ObixXmlFriendlyJSON>({ path, payload }: { path: string; payload?: string }, axiosConfig?: AxiosRequestConfig) {
    const strippedPath = stripPaths(path)[0];
    const { data } = await this.axios.post<T>(`config/${strippedPath}/`, payload, axiosConfig);
    return data;
  }

  async write<T = ObixXmlFriendlyJSON>({ path, payload }: { path: string; payload: string }, axiosConfig?: AxiosRequestConfig) {
    const strippedPath = stripPaths(path)[0];
    const { data } = await this.axios.post<T>(`config/${strippedPath}/`, payload, axiosConfig);
    return data;
  }

  async batch<T = ObixXmlFriendlyJSON>({ payload }: { payload: string }, axiosConfig?: AxiosRequestConfig) {
    const { data } = await this.axios.post<T>(`batch`, payload, axiosConfig);
    return data;
  }
}
