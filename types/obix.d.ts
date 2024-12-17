declare global {
  namespace Obix {
    interface BaseResponse {
      _declaration: {
        _attributes: {
          version: string;
          encoding: string;
        };
      };
      _instruction: {
        'xml-stylesheet': string;
      };
    }

    namespace Batch {
      interface RequestItem {
        path: string;
        action: 'write' | 'read';
        value?: string | boolean | number | null; // Optional, only for 'write' actions
      }
      interface InvalidRequestItem extends RequestItem {
        error: true;
        reason: string;
      }
      // TODO: this isnt used
      interface ErrorResponseItem extends RequestItem {
        error: true;
        reason: string;
      }
      // TODO: this isnt used
      interface ReadResponseItem extends RequestItem {
        action: 'read';
        reason: string;
      }
      // TODO: this isnt used
      interface WriteResponseItem extends RequestItem {
        action: 'write';
        reason: string;
      }
    }
  }
}

export {};
