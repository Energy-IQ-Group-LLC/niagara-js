import { AxiosInstance } from 'axios';
import Papa from 'papaparse';
import { BQLQueryConfig, BQLQueryResult } from '../types/query';

//#region Errors
class MissingBQLQuery extends Error {
  friendlyError: string;
  inDepthError: string;

  constructor() {
    super('Missing BQL query');
    this.name = 'MissingBQLQuery';
    this.friendlyError = this.message;
    this.inDepthError = 'Query parameter missing from request';
  }
}
//#endregion Errors

export class BQLQueryInstance {
  axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  async bqlQuery<T = BQLQueryResult>(query: string, config?: BQLQueryConfig): Promise<T[]> {
    if (!query) {
      throw new MissingBQLQuery();
    }

    const { data } = await this.axiosInstance.get<string>(`ord?${query}|view:file:ITableToCsv`, config?.axiosConfig);

    const parsedResult = Papa.parse<T>(data, {
      dynamicTyping: true,
      header: config?.parseAsObjects ?? true, // defaults to true
      skipEmptyLines: 'greedy',
      transform: (value) => {
        const trimmedValue = value.trim();
        if (trimmedValue === 'NULL' || trimmedValue === 'null') return null;
        return trimmedValue;
      },
    });

    return parsedResult.data;
  }
}
