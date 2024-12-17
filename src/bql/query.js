import Papa from 'papaparse';

//#region Errors
class MissingBQLQuery extends Error {
  constructor() {
    super('Missing BQL query');
    this.name = 'MissingBQLQuery';
    this.friendlyError = this.message;
    this.inDepthError = 'Query parameter missing from request';
  }
}
//#endregion Errors

export class BQLQueryInstance {
  /** @param {import('axios').AxiosInstance} axiosInstance */
  constructor(axiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  /**
   * @param {Object} obj
   * @param {string} obj.query
   * @param {import('axios').AxiosRequestConfig} [axiosConfig]
   * @returns {Promise<Array<Object<string, string | number | boolean | null>>>}
   */
  async bqlQuery({ query }, axiosConfig) {
    if (!query) throw new MissingBQLQuery();

    const { data } = await this.axiosInstance.get(`ord?${query}|view:file:ITableToCsv`, axiosConfig);

    const parsedResult = Papa.parse(data, {
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
