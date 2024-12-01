import type { CookieJar } from 'tough-cookie';

declare module 'axios' {
  interface AxiosInstance {
    cookieJar?: CookieJar;
  }
}

interface AxiosInstanceConfig {
  url: string;
  username?: string;
  password?: string;
  sessionCookie?: string | Cookie;
  timeout?: number;
}
