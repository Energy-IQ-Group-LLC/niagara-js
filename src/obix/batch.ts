import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { makeArray, replaceSpecialChars, stripPaths } from '../helpers.js';
import { buildOutputList } from './parsers/values.js';

export class BatchRequestInstance {
  axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  async batchRequest(batch: Obix.Batch.RequestItem | Obix.Batch.RequestItem[], axiosConfig?: AxiosRequestConfig) {
    // Why? the response doesn't return the path for batch writes, so we much create an array of them to populate the paths in the output
    const writeActionPaths: string[] = [];
    const batchUris: string[] = [];

    const baseURL = this.axiosInstance.defaults.baseURL;

    const batchArray = makeArray(batch);
    const { inputErrors, filteredBatch } = this.#filterInvalidBatchInputs(batchArray);

    filteredBatch.forEach((obj) => {
      const isRead = obj.action == 'read';
      obj.path = stripPaths(obj.path)[0];
      if (!isRead) writeActionPaths.push(obj.path);
      batchUris.push(`
      <uri is="obix:${isRead ? 'Read' : 'Invoke'}" val="${baseURL}config/${obj.path}/${isRead ? 'out' : 'set'}/" >
        ${obj.value != undefined ? `<real name="in" val="${replaceSpecialChars(obj.value)}" />` : ''}
      </uri>`);
    });

    const { data } = await this.axiosInstance.post(
      `batch`,
      `<list>
        ${batchUris.join('')}
      </list>`,
      axiosConfig
    );

    const outputList = buildOutputList(data);
    const writeOutputList = outputList.filter((obj) => obj.action == 'write').map((obj, index) => ({ ...obj, path: writeActionPaths[index] }));
    const readOutputList = outputList.filter((obj) => obj.action == 'read');
    const errorOutputList = outputList.filter((obj) => obj.error);

    return [...inputErrors, ...errorOutputList, ...writeOutputList, ...readOutputList];
  }

  #filterInvalidBatchInputs(batch: Obix.Batch.RequestItem[]) {
    const inputErrors: Obix.Batch.InvalidRequestItem[] = [];

    const errorActions = (objTemp: Obix.Batch.RequestItem, reason: string) => {
      inputErrors.push({ ...objTemp, error: true, reason });
      return false;
    };

    const filteredBatch = batch.filter((obj) => {
      const { path, action, value } = obj;
      if (!path && !action) {
        return errorActions(
          obj,
          `Invalid batch input format, should be formatted as: [{ path: 'test/path', action: 'read' || 'write', value: 'set value if "action" is write' }]`
        );
      } else if (!path) {
        return errorActions(obj, 'No path provided');
      } else if (action != 'write' && action != 'read') {
        return errorActions(obj, 'Action needs to be set to "write" or "read"');
      } else if (action == 'write' && value == undefined) {
        return errorActions(obj, 'Action set to "write", but no value given');
      }
      return true;
    });
    return { inputErrors, filteredBatch };
  }
}
