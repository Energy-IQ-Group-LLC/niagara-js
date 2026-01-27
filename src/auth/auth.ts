import axios, { type AxiosInstance } from 'axios';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';
import { CookieJar } from 'tough-cookie';
import { ScramSha256Client } from './ScramSha256Client';
// import axiosRetry from 'axios-retry';

declare module 'axios' {
  interface AxiosRequestConfig {
    jar?: CookieJar;
  }
}

//#region Errors
abstract class NiagaraError extends Error {
  abstract readonly code: 'NOT_AUTHORIZED' | 'CSRF_MISSING' | 'JSESSIONID_MISSING';

  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NiagaraNotAuthorizedError extends NiagaraError {
  readonly code = 'NOT_AUTHORIZED';
  constructor() {
    super('Session is not authorized');
  }
}

export class NiagaraCsrfError extends NiagaraError {
  readonly code = 'CSRF_MISSING';
  constructor() {
    super('CSRF token not found');
  }
}

export class NiagaraJSessionIdError extends NiagaraError {
  readonly code = 'JSESSIONID_MISSING';
  constructor() {
    super('JSESSIONID cookie not found');
  }
}
//#endregion

//#region Types
type NiagaraSession = {
  baseUrl: string;
  cookieJar: CookieJar;
  csrfToken: string;
};

type NiagaraCookies = Record<string, string>;

type LoginParams = { baseUrl: string; username: string; password: string };

type PostTimeout = Omit<NiagaraSession, 'csrfToken'>;
//#endregion

function createNiagaraHttp(baseUrl: string, cookieJar: CookieJar): AxiosInstance {
  const http = axios.create({
    baseURL: baseUrl,
    timeout: 5000,
    jar: cookieJar,
    withCredentials: true,
    httpAgent: new HttpCookieAgent({ cookies: { jar: cookieJar }, keepAlive: true, maxSockets: 10, maxFreeSockets: 5 }),
    httpsAgent: new HttpsCookieAgent({
      cookies: { jar: cookieJar },
      rejectUnauthorized: false,
      keepAlive: true,
      maxSockets: 10,
      maxFreeSockets: 5,
    }),
    validateStatus: (status) => status < 500,
  });

  http.interceptors.response.use((res) => {
    if (typeof res.data === 'string' && res.data.includes('login/loginN4.js')) {
      throw new NiagaraNotAuthorizedError();
    }
    return res;
  });

  return http;
}

async function login({ baseUrl, username, password }: LoginParams): Promise<NiagaraSession & { cookies: NiagaraCookies }> {
  const cookieJar = new CookieJar();
  const http = createNiagaraHttp(baseUrl, cookieJar);

  const scram = new ScramSha256Client(username, password);

  // ---- SCRAM ----
  const c1 = scram.createClientFirstMessage();
  const s1 = (
    await http.post<string>('/j_security_check/', `action=sendClientFirstMessage&clientFirstMessage=${c1}`, {
      headers: { 'Content-Type': 'application/x-niagara-login-support' },
    })
  ).data;

  const c2 = scram.createClientFinalMessage(s1);
  const s2 = (
    await http.post<string>('/j_security_check/', `action=sendClientFinalMessage&clientFinalMessage=${c2}`, {
      headers: { 'Content-Type': 'application/x-niagara-login-support' },
    })
  ).data;

  scram.verifyServerFinalMessage(s2);

  // ---- Cookies ----
  const getCookies = () => Object.fromEntries(cookieJar.getCookiesSync(baseUrl).map((c) => [c.key, c.value]));
  if (!getCookies().JSESSIONID) throw new NiagaraJSessionIdError();

  // ---- CSRF ----
  const html = (await http.get<string>('/j_security_check/')).data;
  const csrfToken = html.match(/<input[^>]*id=['"]csrfToken['"][^>]*value=['"]([^'"]+)['"][^>]*>/)?.[1];
  if (!csrfToken) throw new NiagaraCsrfError();

  return {
    baseUrl,
    csrfToken,
    cookieJar,
    get cookies() {
      return getCookies();
    },
  };
}

async function logout({ baseUrl, cookieJar, csrfToken }: NiagaraSession): Promise<void> {
  const http = createNiagaraHttp(baseUrl, cookieJar);

  try {
    await http.get('/logout', {
      params: { csrfToken },
    });
  } catch (error) {
    if (!(error instanceof NiagaraNotAuthorizedError)) {
      throw error;
    }
  }
}

async function postTimeout({ baseUrl, cookieJar }: PostTimeout, offset = 0): Promise<number> {
  const http = createNiagaraHttp(baseUrl, cookieJar);
  const res = await http.post<number>('/timeout', `offset=${offset}`, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  return res.data;
}

async function sendKeepAlive(params: PostTimeout): Promise<void> {
  await postTimeout(params);
}

// TODO: add JSDoc comments - returns ms remaining until logout given time since offset which is the time since last activity
// TODO: this function is a bit useless. maybe it should calculate the offset for client use.
async function queryRemainingTime(params: PostTimeout, offset?: number): Promise<number> {
  return await postTimeout(params, offset);
}

async function validate(params: PostTimeout): Promise<boolean> {
  try {
    await postTimeout(params);
    return true;
  } catch {
    return false;
  }
}

function createCookieJarFromCookies({ baseUrl, cookies }: { baseUrl: string; cookies: NiagaraCookies }): CookieJar {
  const jar = new CookieJar();
  for (const [k, v] of Object.entries(cookies)) {
    jar.setCookieSync(`${k}=${v}`, baseUrl);
  }
  return jar;
}

export const digestAuth = {
  login,
  logout,
  session: {
    sendKeepAlive,
    queryRemainingTime,
    validate,
    createCookieJarFromCookies,
  },
};
