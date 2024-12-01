import { JSDOM } from 'jsdom';
import vm from 'vm';
import { stripTrailingSlash } from './helpers.js';

/**
 * @param {string} siteUrl
 * @param {Object} auth - Digest auth credentials
 * @param {string} auth.username
 * @param {string} auth.password
 */
export async function digestAuthLogin(siteUrl, { username, password }) {
  siteUrl = stripTrailingSlash(siteUrl);

  const scriptUrl = `${siteUrl}/login/core/auth.min.js`;
  const scriptResponse = await fetch(scriptUrl);
  const scriptContent = await scriptResponse.text();

  const dom = new JSDOM('', { url: siteUrl });
  const { window } = dom;

  vm.createContext(window); // Set up the context
  vm.runInContext(scriptContent, window); // Run the auth.min.js script

  // This gets the JSESSIONID cookie to be set on the jsdom window
  await new Promise((resolve, reject) => {
    window.ScramShaClient.authenticate(`${siteUrl}/`, username, password, window.sjcl.hash.sha256, {
      // @ts-ignore
      ok: (response) => resolve(response),
      // @ts-ignore
      fail: (error) => reject(error),
    });
  });

  window.close();

  // This activates the JSESSIONID cookie on Niagara's system
  const loginCookies = dom.cookieJar.getCookiesSync(siteUrl);
  await fetch(`${siteUrl}/j_security_check/`, {
    method: 'GET',
    headers: {
      Cookie: loginCookies.map((cookie) => `${cookie.key}=${cookie.value}`).join('; '),
    },
  });

  return loginCookies;
}

// export async function logout(params) {}
