declare global {
  // Populated from this obix url: /obix/xsd
  namespace ObixAttributes {
    // Simple Types

    export type Status = 'disabled' | 'fault' | 'down' | 'unackedAlarm' | 'alarm' | 'unacked' | 'overridden' | 'ok';
    export type Contract = string; // Could be a list of space separated values

    // Complex Types

    export interface Obj {
      display?: string;
      displayName?: string;
      href?: string;
      icon?: string;
      is?: Contract;
      name?: string;
      null?: boolean;
      status?: Status; // Default: 'ok'
      writable?: boolean; // Default: true
    }

    export interface AbsTime extends Obj {
      min?: string; // xs:dateTime
      max?: string; // xs:dateTime
      val?: string; // xs:dateTime
    }

    export interface Bool extends Obj {
      range?: string; // anyURI
      val?: boolean; // xs:boolean
    }

    export interface Err extends Obj {}

    export interface Enum extends Obj {
      range?: string; // anyURI
      val?: string; // xs:NMTOKEN
    }

    export interface Feed extends Obj {
      in?: Contract; // Default: obix:Nil
      of?: Contract; // Default: obix:obj
    }

    export interface Int extends Obj {
      min?: number; // xs:int
      max?: number; // xs:int
      unit?: string; // anyURI
      val?: number; // xs:int
    }

    export interface List extends Obj {
      min?: number; // xs:int
      max?: number; // xs:int
      of?: Contract; // Default: obix:obj
    }

    export interface Op extends Obj {
      in?: Contract; // Default: obix:Nil
      out?: Contract; // Default: obix:Nil
    }

    export interface Real extends Obj {
      min?: number; // xs:double
      max?: number; // xs:double
      precision?: number; // xs:int
      unit?: string; // anyURI
      val?: number; // xs:double
    }

    export interface Ref extends Obj {}

    export interface RelTime extends Obj {
      min?: string; // xs:duration
      max?: string; // xs:duration
      val?: string; // xs:duration
    }

    export interface Str extends Obj {
      min?: number; // xs:int
      max?: number; // xs:int
      val?: string; // xs:string
    }

    export interface Uri extends Obj {
      val?: string; // xs:anyURI
    }

    // Global Elements

    export interface AttributeMapping {
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
      [key: string]: any; // Allow for extra dynamic keys
    }
  }

  export type ObixElementRoot = {
    [key in keyof ObixAttributes.AttributeMapping]?: ObixElement<ObixAttributes.AttributeMapping[key]>[]; // Explicitly include predefined keys
  } & {
    [key: string]: ObixElement<any>[] | undefined; // Allow for additional arbitrary keys
  };

  /**
   * This is the parsed xml payload format which also includes the standard obix tags and attributes.
   */
  export type ObixElement<T> = ObixElementRoot & {
    attributes?: T; // The attributes specific to this element
  };

  //#region Obix Unit
  export interface ObixUnit {
    obj: {
      str: UnitString[];
      obj: UnitDimension[];
      real: UnitReal[];
      attributes: {
        href: string;
        is: 'obix:Unit';
      };
    }[];
  }

  interface UnitString {
    attributes: {
      name: 'description' | 'symbol';
      val: string;
    };
  }

  interface UnitDimension {
    int: UnitInt[];
    attributes: {
      name: 'dimension';
    };
  }

  interface UnitInt {
    attributes: {
      name: 'kg' | 'm' | 'sec' | 'K' | 'A' | 'mol' | 'cd';
      val: number;
    };
  }

  interface UnitReal {
    attributes: {
      name: 'scale' | 'offset';
      val: number;
    };
  }
  //#endregion Obix Unit
}

export {};
