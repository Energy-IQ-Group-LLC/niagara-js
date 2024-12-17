import type { CookieJar, Cookie } from 'tough-cookie';

declare module 'axios' {
  interface AxiosInstance {
    cookieJar?: CookieJar;
  }
}

declare global {
  interface AxiosInstanceConfig {
    url: string;
    username?: string;
    password?: string;
    sessionCookie?: string | Cookie;
    timeout?: number;
  }
}

export {};
