import { AxiosRequestConfig } from 'axios';

export type BQLQueryConfig = {
  parseAsObjects?: boolean;
  axiosConfig?: AxiosRequestConfig;
};

export type BQLQueryResult = Record<string, string | number | boolean | null>;
