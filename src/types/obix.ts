// Populated from this obix url: /obix/xsd
export namespace ObixAttributes {
  // Simple Types

  export type Status = 'disabled' | 'fault' | 'down' | 'unackedAlarm' | 'alarm' | 'unacked' | 'overridden' | 'ok';
  export type Contract = string; // Could be a list of space separated values

  // Complex Types

  export type Obj = {
    display?: string;
    displayName?: string;
    href?: string;
    icon?: string;
    is?: Contract;
    name?: string;
    null?: boolean;
    status?: Status; // Default: 'ok'
    writable?: boolean; // Default: true
  };

  export type AbsTime = Obj & {
    min?: string; // xs:dateTime
    max?: string; // xs:dateTime
    val?: string; // xs:dateTime
  };

  export type Bool = Obj & {
    range?: string; // anyURI
    val?: boolean; // xs:boolean
  };

  export type Err = Obj & {};

  export type Enum = Obj & {
    range?: string; // anyURI
    val?: string; // xs:NMTOKEN
  };

  export type Feed = Obj & {
    in?: Contract; // Default: obix:Nil
    of?: Contract; // Default: obix:obj
  };

  export type Int = Obj & {
    min?: number; // xs:int
    max?: number; // xs:int
    unit?: string; // anyURI
    val?: number; // xs:int
  };

  export type List = Obj & {
    min?: number; // xs:int
    max?: number; // xs:int
    of?: Contract; // Default: obix:obj
  };

  export type Op = Obj & {
    in?: Contract; // Default: obix:Nil
    out?: Contract; // Default: obix:Nil
  };

  export type Real = Obj & {
    min?: number; // xs:double
    max?: number; // xs:double
    precision?: number; // xs:int
    unit?: string; // anyURI
    val?: number; // xs:double
  };

  export type Ref = Obj & {};

  export type RelTime = Obj & {
    min?: string; // xs:duration
    max?: string; // xs:duration
    val?: string; // xs:duration
  };

  export type Str = Obj & {
    min?: number; // xs:int
    max?: number; // xs:int
    val?: string; // xs:string
  };

  export type Uri = Obj & {
    val?: string; // xs:anyURI
  };

  // Global Elements

  export type AttributeMapping = {
    obj?: Obj;
    absTime?: AbsTime;
    bool?: Bool;
    enum?: Enum;
    err?: Err;
    feed?: Feed;
    int?: Int;
    list?: List;
    op?: Op;
    real?: Real;
    ref?: Ref;
    relTime?: RelTime;
    str?: Str;
    uri?: Uri;
  };
}

export type ObixElementRoot = {
  [K in keyof ObixAttributes.AttributeMapping]?: ObixElement<ObixAttributes.AttributeMapping[K]>[]; // Explicitly include predefined keys
} & {
  [key: string]: any; // Allow for additional arbitrary keys
};

/**
 * This is the parsed xml payload format which also includes the standard obix tags and attributes.
 */
export type ObixElement<T> = ObixElementRoot & {
  [key in keyof T as `$${string & key}`]: T[key]; // The attributes specific to this element
};

// EXAMPLE:
// if (obixXmlFriendlyJSON.type == 'int') {
//   obixXmlFriendlyJSON.max;
// }
// const intData = obixXmlFriendlyJSON as ObixXmlFriendlyJSON<'int'>;
// const max = intData.max; // 'max' is now accessible
export type ObixXmlFriendlyJSON<T extends keyof ObixAttributes.AttributeMapping = keyof ObixAttributes.AttributeMapping> = {
  [key: string]: any;
  nodes?: ObixXmlFriendlyJSON[]; // Recursive definition
} & {
  [K in T]: {
    type?: K;
  } & ObixAttributes.AttributeMapping[K];
}[T];
