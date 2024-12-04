import { stripTrailingSlash } from '@/helpers.js';
import { JSDOM } from 'jsdom';
import vm from 'vm';

/**
 * @param {string} siteUrl
 * @param {Object} auth - Digest auth credentials
 * @param {string} auth.username
 * @param {string} auth.password
 */
export async function digestAuthLogin(siteUrl, { username, password }) {
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

// export async function logout(params) {}
