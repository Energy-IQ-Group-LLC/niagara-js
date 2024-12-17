import { stripTrailingSlash } from './helpers.js';
import { JSDOM } from 'jsdom';
import vm from 'vm';

/**
 * @param {string} siteUrl
 * @param {Object} auth - Digest auth credentials
 * @param {string} auth.username
 * @param {string} auth.password
 */
export async function getDigestAuthLoginCookies(siteUrl, { username, password }) {
  const siteUrlFormatted = stripTrailingSlash(siteUrl);

  const scriptUrl = `${siteUrlFormatted}/login/core/auth.min.js`;
  const scriptResponse = await fetch(scriptUrl);
  const scriptContent = await scriptResponse.text();

  const dom = new JSDOM('', { url: siteUrlFormatted });
  const { window } = dom;

  try {
    vm.createContext(window); // Set up the context
    vm.runInContext(scriptContent, window); // Run the auth.min.js script

    // This gets the JSESSIONID cookie to be set on the jsdom window
    await new Promise((resolve, reject) => {
      window.ScramShaClient.authenticate(`${siteUrlFormatted}/`, username, password, window.sjcl.hash.sha256, {
        // @ts-ignore
        ok: (response) => resolve(response),
        // @ts-ignore
        fail: (error) => reject(error),
      });
    });

    // This activates the JSESSIONID cookie on Niagara's system
    const loginCookies = dom.cookieJar.getCookiesSync(siteUrlFormatted);
    await fetch(`${siteUrlFormatted}/j_security_check/`, {
      method: 'GET',
      headers: {
        Cookie: loginCookies.map((cookie) => `${cookie.key}=${cookie.value}`).join('; '),
      },
    });

    return loginCookies;
  } finally {
    window.close();
  }
}

/**
 * @param {string} siteUrl
 * @param {string} sessionCookieString
 */
export async function logoutDigestAuth(siteUrl, sessionCookieString) {
  const siteUrlFormatted = stripTrailingSlash(siteUrl);

  // Getting the logout page so we can parse out the csrf token
  const response = await fetch(`${siteUrlFormatted}/logout`, {
    method: 'GET',
    headers: {
      Cookie: sessionCookieString,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch logout HTML: ${response.statusText}`);
  }

  // Extract csrfToken
  const responseText = await response.text();
  const match = responseText.match(/doConfirm\('([^']+)'\)/);
  if (!match || !match[1]) throw new Error('No CSRF token found');
  const csrfToken = encodeURIComponent(match[1]);

  await fetch(`${siteUrlFormatted}/logout?csrfToken=${csrfToken}`, {
    method: 'GET',
    headers: {
      Cookie: sessionCookieString,
    },
  });
}

/**
 * @param {string} siteUrl
 * @param {string} sessionCookieString
 */
export async function isSessionCookieValid(siteUrl, sessionCookieString) {
  const siteUrlFormatted = stripTrailingSlash(siteUrl);

  // Validate session cookie
  const result = await fetch(`${siteUrlFormatted}/timeout`, {
    method: 'POST',
    headers: {
      Cookie: sessionCookieString,
    },
  });

  // If the result is redirected, it means the timeout post redirected to niagara login page.
  if (result.redirected) {
    return false;
  }
  return true;
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
