import axios from 'axios';
import axiosRetry from 'axios-retry';
import https from 'https';
import { JSDOM, ResourceLoader } from 'jsdom';
import vm from 'vm';
import { stripTrailingSlash } from '../helpers.js';

const axiosIgnoreCertError = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  timeout: 10000,
});

class NotAuthorizedError extends Error {
  constructor() {
    super('Not Authorized');
    this.name = 'NotAuthorizedError';
  }
}

axiosIgnoreCertError.interceptors.response.use((response) => {
  if (typeof response.data == 'string' && response.data.includes('login/loginN4.js')) {
    throw new NotAuthorizedError();
  }
  return response;
});

axiosRetry(axiosIgnoreCertError, { retries: 3 });

export async function getDigestAuthLoginCookies(siteUrl: string, { username, password }: { username: string; password: string }) {
  const siteUrlFormatted = stripTrailingSlash(siteUrl);

  const scriptUrl = `${siteUrlFormatted}/login/core/auth.min.js`;
  const scriptResponse = await axiosIgnoreCertError.get(scriptUrl);

  const dom = new JSDOM('', {
    url: siteUrlFormatted,
    resources: new ResourceLoader({
      strictSSL: false,
    }),
  });
  const { window } = dom;

  try {
    vm.createContext(window); // Set up the context
    vm.runInContext(scriptResponse.data, window); // Add the auth.min.js script to the window

    // This gets the JSESSIONID cookie to be set on the jsdom window
    await new Promise((resolve, reject) => {
      window.ScramShaClient.authenticate(`${siteUrlFormatted}/`, username, password, window.sjcl.hash.sha256, {
        // @ts-ignore
        ok: (response) => resolve(response),
        // @ts-ignore
        fail: () => reject('Could not authenticate'),
      });
    });

    // This activates the JSESSIONID cookie on Niagara's system
    const loginCookies = dom.cookieJar.getCookiesSync(siteUrlFormatted);
    await axiosIgnoreCertError.get(`${siteUrlFormatted}/j_security_check/`, {
      headers: {
        Cookie: loginCookies.map((cookie) => `${cookie.key}=${cookie.value}`).join('; '),
      },
    });

    return loginCookies;
  } finally {
    window.close();
  }
}

export async function logoutDigestAuth(siteUrl: string, sessionCookieString: string) {
  const siteUrlFormatted = stripTrailingSlash(siteUrl);

  // Getting the logout page so we can parse out the csrf token
  const response = await axiosIgnoreCertError.get(`${siteUrlFormatted}/logout`, {
    headers: {
      Cookie: sessionCookieString,
    },
  });

  // Extract csrfToken
  const match = response.data.match(/doConfirm\('([^']+)'\)/);
  if (!match || !match[1]) throw new Error('No CSRF token found');
  const csrfToken = encodeURIComponent(match[1]);

  await axiosIgnoreCertError.get(`${siteUrlFormatted}/logout?csrfToken=${csrfToken}`, {
    headers: {
      Cookie: sessionCookieString,
    },
  });
}

export async function isSessionCookieValid(siteUrl: string, sessionCookieString: string) {
  const siteUrlFormatted = stripTrailingSlash(siteUrl);

  try {
    // Validate session cookie
    await axiosIgnoreCertError.post(`${siteUrlFormatted}/timeout`, null, {
      headers: {
        Cookie: sessionCookieString,
      },
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// /**
//  * @param {string} siteUrl
//  * @param {string} sessionCookieString
//  */
// export async function getSessionTimeoutRemaining(siteUrl, sessionCookieString) {
//   const siteUrlFormatted = stripTrailingSlash(siteUrl);

//   // Validate session cookie
//   const result = await fetch(`${siteUrlFormatted}/timeout`, {
//     method: 'POST',
//     headers: {
//       Cookie: sessionCookieString,
//     },
//   });
//   if(result.ok)
//     return result.text();
//   else
//   throw new Error

// }
