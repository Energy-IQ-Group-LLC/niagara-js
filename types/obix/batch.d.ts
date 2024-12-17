// TODO: do typings?

interface ObixRef {
  name: string;
  href: string;
  is?: string; // Interface of the reference (optional)
  [key: string]: string | undefined; // Allow for additional unknown attributes
}

interface ObixOperation {
  name: string;
  href: string;
  in?: string; // Input type of the operation (optional)
  displayName?: string; // Display name of the operation (optional)
  [key: string]: string | undefined; // Allow for additional unknown attributes
}

interface ObixReal {
  _attributes: ObixAttribute;
  str?: ObixAttribute[]; // Array of string attributes (optional)
  ref?: ObixRef[]; // Array of reference attributes (optional)
  real?: ObixReal[]; // Array of nested real elements (optional)
  abstime?: ObixAttribute; // Absolute time attribute (optional)
  op?: ObixOperation[]; // Array of operation attributes (optional)
}

interface ObixErr {
  _attributes: {
    href: string;
    is: string;
    display: string;
  };
}

interface ObixList {
  _attributes: {
    of: string;
    xmlns: string;
    'xsi:schemaLocation': string;
    'xmlns:xsi': string;
  };
  err?: ObixErr | ObixErr[];
}

interface BatchOut extends Obix.BaseResponse {
  list: ObixList;
}

export {};
