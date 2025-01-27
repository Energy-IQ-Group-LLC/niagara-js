import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { stripPaths } from '../helpers.js';
import { QueryObject, HistoryPresetResponse, HistoryQueryResponse, HistoryRollupResponse } from '../types/history.js';

const PRESET_OPTIONS = [
  'today',
  'yesterday',
  'last24Hours',
  'weekToDate',
  'lastWeek',
  'last7Days',
  'monthToDate',
  'lastMonth',
  'yearToDate (limit=1000)',
  'lastYear (limit=1000)',
  'unboundedQuery',
] as const;

//#region Errors
class MissingHistoryQuery extends Error {
  friendlyError: string;
  inDepthError: string;

  constructor() {
    super('Missing history query');
    this.name = 'MissingHistoryQuery';
    this.friendlyError = this.message;
    this.inDepthError = this.message;
  }
}

class InvalidHistoryPresetQuery extends Error {
  friendlyError: string;
  inDepthError: string;

  constructor(query: string) {
    super(`Invalid preset history query: ${query}`);
    this.name = 'InvalidHistoryPresetQuery';
    this.friendlyError = this.message;
    this.inDepthError = `Valid preset queries include:\n${PRESET_OPTIONS.join('\n')}`;
  }
}

class InvalidHistoryQueryParameter extends Error {
  friendlyError?: string;
  inDepthError?: string;

  constructor(parameter: string, paramValue: any) {
    super(`Invalid parameter in history query: ${parameter}`);
    this.name = 'InvalidHistoryQueryParameter';
    if (parameter == 'limit') {
      this.friendlyError = this.message;
      this.inDepthError = `'limit' parameter must be an number but received : ${paramValue}`;
    } else if (parameter == 'start' || parameter == 'end') {
      this.friendlyError = this.message;
      this.inDepthError = `'${parameter}' parameter must be a valid date but received : ${paramValue}`;
    }
  }
}
//#endregion Errors

export class HistoryRequestInstance {
  axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  async historyRequest({ path, query }: { path: string; query: (typeof PRESET_OPTIONS)[number] | QueryObject }, axiosConfig?: AxiosRequestConfig) {
    if (!query) throw new MissingHistoryQuery();
    const strippedPath = stripPaths(path)[0];

    // Check if query is a presetQuery or custom timestamps
    if (typeof query == 'string') {
      if (!PRESET_OPTIONS.some((option) => option == query)) {
        throw new InvalidHistoryPresetQuery(query);
      }

      // Call to get all preset queries
      const { data: presetQueryData } = await this.axiosInstance.get<HistoryPresetResponse>(`histories/${strippedPath}`, axiosConfig);
      //@ts-ignore
      const queryHref = presetQueryData.nodes.find((node) => node.name == query).href as string;
      const { data } = await this.axiosInstance.get<HistoryQueryResponse>(`histories/${strippedPath}${queryHref}`, axiosConfig);
      return data;
    } else {
      if (query.start) {
        try {
          query.start = new Date(query.start).toISOString();
        } catch (error) {
          throw new InvalidHistoryQueryParameter('start', query.start);
        }
      }
      if (query.end) {
        try {
          query.end = new Date(query.end).toISOString();
        } catch (error) {
          throw new InvalidHistoryQueryParameter('end', query.end);
        }
      }
      if (query.limit) {
        if (!Number.isInteger(Number(query.limit))) {
          throw new InvalidHistoryQueryParameter('limit', query.limit);
        }
      }

      const { data } = await this.axiosInstance.get<HistoryQueryResponse>(`histories/${strippedPath}/~historyQuery/`, {
        params: query,
        ...axiosConfig,
      });
      return data;
    }
  }

  async rollupRequest({ path, interval, query }: { path: string; interval: string | number; query?: QueryObject }, axiosConfig: AxiosRequestConfig) {
    const strippedPath = stripPaths(path)[0];

    const intervalPayload =
      typeof interval == 'number' ? `<real name="interval" val="${interval}" />` : `<reltime name="interval" val="${interval}" />`;

    const payload = `
    <obj>
      ${query?.limit ? `<int name="limit" val="${query.limit}" />` : ''}
      ${query?.start ? `<abstime name="start" val="${query.start}"/>` : ''}
      ${query?.limit ? `<int name="end" val="${query.end}" />` : ''}
      ${intervalPayload}
    </obj>
    `;

    const { data } = await this.axiosInstance.post<HistoryRollupResponse>(`histories/${strippedPath}/~historyRollup/`, payload, axiosConfig);
    return data;
  }
}
