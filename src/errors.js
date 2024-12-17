export class HTTPError extends Error {
  /** @param {import('axios').AxiosError} error */
  constructor(error) {
    super(error.message);
    this.name = 'HTTPError';

    if (error?.code?.includes('ECONNABORTED')) {
      this.friendlyError = 'Connection Error - Timeout';
      this.inDepthError =
        'Error ECONNABORTED- Connection to server could not be established:\n' +
        '\n1. Check the configured IP Address and Port' +
        '\n2. Ensure http/https is enabled in the WebServices in Niagara';
    } else if (error?.message?.includes('401')) {
      this.friendlyError = 'Invalid Username/Password - 401';
      this.inDepthError =
        'Error 401 - Invalid Credentials:\n' +
        '\n1. Ensure the Username / Password is correct' +
        '\n2. Ensure the Obix user account has HTTPBasicScheme authentication (Check Documentation in Github for more details)';
    } else if (error?.message?.includes('403')) {
      this.friendlyError = 'Permission Error - 403';
      this.inDepthError = 'Error 403 - Permission Error:\n' + '\n1. Ensure the obix user has the admin role assigned / admin privileges';
    } else if (error?.message?.includes('404')) {
      this.friendlyError = 'Obix Driver Missing - 404';
      this.inDepthError =
        'Error 404 - Obix Driver most likely missing:\n' +
        '\n1. Ensure the obix driver is placed directly under the Drivers in the Niagara tree (Check Documentation in Github for more details)';
    } else if (error?.message?.includes('wrong version number')) {
      this.friendlyError = 'Possibly Wrong Port/Protocol';
      this.inDepthError = 'Check the port and security protocol';
    } else {
      this.friendlyError = error.message;
    }

    this.message = this.friendlyError;
  }
}

// Invalid Path Error
export class PathError extends Error {
  /**
   * @param {string} path
   * @param {string} [reason]
   * @param {string} [href]
   */
  constructor(path, reason, href) {
    super(`Invalid Path/Uri: ${path}`);
    this.name = 'PathError';
    this.friendlyError = this.message;
    this.inDepthError = `${reason || path}${href ? ` : ${href}` : ''}`;
  }
}

// Invalid input type
export class InvalidTypeError extends Error {
  constructor() {
    super('Invalid Input Type');
    this.name = 'InvalidTypeError';
    this.friendlyError = this.message;
    this.inDepthError = 'Invalid Input Type:\nData Type of input does not match that of value trying to be written to';
  }
}

// Unknown Data type
export class UnknownTypeError extends Error {
  constructor() {
    super('Unknown Data Type');
    this.name = 'UnknownTypeError';
    this.friendlyError = this.message;
    this.inDepthError = 'Error with Value Parsing: Unknown Data Type';
  }
}

export class BQLHTTPError extends Error {
  /** @param {import('axios').AxiosError} error */
  constructor(error) {
    super(error.message);
    this.name = 'HTTPError';

    if (error?.code?.includes('ECONNABORTED')) {
      this.friendlyError = 'Connection Error - Timeout';
      this.inDepthError =
        'Error ECONNABORTED- Connection to server could not be established:\n' +
        '\n1. Check the configured IP Address and Port' +
        '\n2. Ensure http/https is enabled in the WebServices in Niagara';
    } else if (error?.message?.includes('401')) {
      this.friendlyError = 'Invalid Username/Password - 401';
      this.inDepthError =
        'Error 401 - Invalid Credentials:\n' +
        '\n1. Ensure the Username / Password is correct' +
        '\n2. Ensure the user account has HTTPBasicScheme authentication (Check Documentation in Github for more details)';
    } else if (error?.message?.includes('403')) {
      this.friendlyError = 'Permission Error - 403';
      this.inDepthError = 'Error 403 - Permission Error:\n' + '\n1. Ensure the user has the admin role assigned / admin privileges';
    } else if (error?.message?.includes('404')) {
      this.friendlyError = 'Invalid Ord/Query - 404';
      this.inDepthError = 'Error 404 - BQL Query most likely incorrect.';
    } else if (error?.message?.includes('wrong version number')) {
      this.friendlyError = 'Possibly Wrong Port/Protocol';
      this.inDepthError = 'Check the port and security protocol';
    } else {
      this.friendlyError = error.message;
    }

    this.message = this.friendlyError;
    this.responseData = error.response?.data;
  }
}
