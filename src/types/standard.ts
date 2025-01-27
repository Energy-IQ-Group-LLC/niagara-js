export interface ObixAbout {
  href: string;
  is: 'obix:About';
  display: 'Obix About';
  nodes: [
    {
      name: 'obixVersion';
      val: number | string;
      href: 'obixVersion/';
      displayName: 'Obix Version';
      type: 'str';
    },
    {
      name: 'serverName';
      val: string;
      href: 'serverName/';
      displayName: 'Server Name';
      type: 'str';
    },
    {
      name: 'vendorName';
      val: string;
      href: 'vendorName/';
      displayName: 'Vendor Name';
      type: 'str';
    },
    {
      name: 'productName';
      val: string;
      href: 'productName/';
      displayName: 'Product Name';
      type: 'str';
    },
    {
      name: 'productVersion';
      val: string;
      href: 'productVersion/';
      displayName: 'Product Version';
      type: 'str';
    },
    {
      name: 'tz';
      val: string;
      href: 'tz/';
      displayName: 'Tz';
      type: 'str';
    },
    {
      name: 'componentCount';
      val: string | number;
      href: 'componentCount/';
      displayName: 'Component Count';
      type: 'str';
    },
    {
      name: 'localHistoryCount';
      val: string | number;
      href: 'localHistoryCount/';
      displayName: 'Local History Count';
      type: 'str';
    },
    {
      name: 'serverTime';
      val: string;
      href: 'serverTime/';
      display: string;
      displayName: 'Server Time';
      tz: string;
      type: 'abstime';
    },
    {
      name: 'serverBootTime';
      val: string;
      href: 'serverBootTime/';
      display: string;
      displayName: 'Server Boot Time';
      tz: string;
      type: 'abstime';
    },
    {
      name: 'vendorUrl';
      val: string;
      href: 'vendorUrl/';
      displayName: 'Vendor Url';
      type: 'uri';
    },
    {
      name: 'productUrl';
      val: string;
      href: 'productUrl/';
      displayName: 'Product Url';
      type: 'uri';
    }
  ];
  type: 'obj';
}

export interface ObixUnit {
  href: string;
  is: 'obix:Unit';
  type: 'obj';
  nodes: [
    { name: 'description'; type: 'str'; val: string },
    { name: 'symbol'; type: 'str'; val: string },
    {
      name: 'dimension';
      type: 'obj';
      nodes: [
        { name: 'kg'; type: 'int'; val: number },
        { name: 'm'; type: 'int'; val: number },
        { name: 'sec'; type: 'int'; val: number },
        { name: 'K'; type: 'int'; val: number },
        { name: 'A'; type: 'int'; val: number },
        { name: 'mol'; type: 'int'; val: number },
        { name: 'cd'; type: 'int'; val: number }
      ];
    },
    { name: 'scale'; type: 'real'; val: number },
    { name: 'offset'; type: 'real'; val: number }
  ];
}
