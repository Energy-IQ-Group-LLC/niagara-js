import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js'; // dependent on utc plugin
import utc from 'dayjs/plugin/utc.js';

// Order matters here
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);

import { makeArray, stripPaths } from '../helpers.js';

/**
 * @typedef {Object} QueryObject
 * @property {string | number | undefined} start
 * @property {string | number | undefined} end
 * @property {string | number | undefined} limit
 */

const PRESET_OPTIONS = [
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
];

//#region Errors
class MissingHistoryQuery extends Error {
  constructor() {
    super('Missing history query');
    this.name = 'MissingHistoryQuery';
    this.friendlyError = this.message;
    this.inDepthError = this.message;
  }
}

class InvalidHistoryPresetQuery extends Error {
  /**
   * @param {string} query
   */
  constructor(query) {
    super(`Invalid preset history query: ${query}`);
    this.name = 'InvalidHistoryPresetQuery';
    this.friendlyError = this.message;
    this.inDepthError = `Valid preset queries include:\n${PRESET_OPTIONS.join('\n')}`;
  }
}

class InvalidHistoryQueryParameter extends Error {
  /**
   * @param {string} parameter
   * @param {any} paramValue
   */
  constructor(parameter, paramValue) {
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
  /** @param {import('axios').AxiosInstance} axiosInstance */
  constructor(axiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  /**
   * @param {Object} obj
   * @param {string} obj.path
   * @param {string | QueryObject} obj.query
   */
  async historyRequest({ path, query }) {
    if (!query) throw new MissingHistoryQuery();
    path = stripPaths(path)[0];
    let historyData;

    // Check if query is a presetQuery or custom timestamps
    if (typeof query == 'string') {
      if (!PRESET_OPTIONS.some((option) => option == query)) {
        throw new InvalidHistoryPresetQuery(query);
      }

      // Call to get all preset queries
      const { data: presetQueryData } = await this.axiosInstance.get(`histories/${path}`);
      query = presetQueryData.obj.ref.find((/** @type {{ _attributes: { name: any; }; }} */ presetQuery) => presetQuery._attributes.name == query)
        ?._attributes.href;
      historyData = (await this.axiosInstance.get(`histories/${path}${query}`)).data;
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

      historyData = (await this.axiosInstance.get(`histories/${path}/~historyQuery/`, { params: query })).data;
    }
    return this.#parseHistoryDataHelper({ data: historyData.obj, path });
  }

  /**
   * @param {Object} obj
   * @param {*} obj.data
   * @param {string} obj.path
   */
  #parseHistoryDataHelper({ data, path }) {
    const timezone = data.obj.abstime._attributes.tz;
    const limit = data.int._attributes.val;
    // @ts-ignore
    let start = data.abstime.find((abstime) => abstime._attributes.name == 'start')._attributes.val;
    // @ts-ignore
    let end = data.abstime.find((abstime) => abstime._attributes.name == 'end')._attributes.val;
    // @ts-ignore
    start = dayjs(data.abstime[0]._attributes.val).tz(timezone).format('LLLL z');
    // @ts-ignore
    end = dayjs(data.abstime[1]._attributes.val).tz(timezone).format('LLLL z');

    const dataObjList = makeArray(data.list.obj);
    const values = dataObjList.map((dataObj) => ({
      // @ts-ignore
      timestamp: dayjs(dataObj.abstime._attributes.val).tz(timezone).format('LLLL z'),
      value: String(dataObj.real._attributes.val),
    }));

    return {
      history: path,
      start,
      end,
      limit,
      timezone,
      results: values,
    };
  }
}
