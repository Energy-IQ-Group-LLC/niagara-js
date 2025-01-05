import { AxiosInstance, AxiosRequestConfig } from 'axios';
import Papa from 'papaparse';

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

type BQLQueryResults<T = Record<string, string | number | boolean | null>> = Array<T>;

export class BQLQueryInstance {
  axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  async bqlQuery<T>(query: string, axiosConfig?: AxiosRequestConfig) {
    if (!query) {
      throw new MissingBQLQuery();
    }

    const { data } = await this.axiosInstance.get<string>(`ord?${query}|view:file:ITableToCsv`, axiosConfig);

    const parsedResult = Papa.parse<BQLQueryResults<T>>(data, {
      dynamicTyping: true,
      header: true,
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
