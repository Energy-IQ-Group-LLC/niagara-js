export type QueryObject = {
  start: string | number | undefined;
  end: string | number | undefined;
  limit: string | number | undefined;
};

export type HistoryPresetResponse = {
  href: string;
  is: 'obix:History';
  display: string;
  icon: string;
  nodes: [
    { name: 'count'; val: number; type: 'int' },
    { name: 'start'; val: string; tz: string; type: 'abstime' },
    { name: 'end'; val: string; tz: string; type: 'abstime' },
    { name: 'query'; href: '~historyQuery/'; in: '/obix/def/obix:HistoryFilter'; out: '/obix/def/obix:HistoryQueryOut'; type: 'op' },
    { name: 'rollup'; href: '~historyRollup/'; in: '/obix/def/obix:HistoryRollupIn'; out: '/obix/def/obix:HistoryRollupOut'; type: 'op' },
    { name: 'append'; href: '~historyAppend/'; in: '/obix/def/obix:HistoryAppendIn'; out: '/obix/def/obix:HistoryAppendOut'; type: 'op' },
    { name: 'feed'; href: '~historyFeed/'; of: '/obix/def/obix:HistoryRecord'; in: '/obix/def/obix:HistoryFilter'; type: 'feed' },
    { name: 'unboundedQuery'; href: '~historyQuery?limit=1000'; type: 'ref' },
    { name: 'today'; href: string; type: 'ref' },
    { name: 'last24Hours'; href: string; type: 'ref' },
    { name: 'yesterday'; href: string; type: 'ref' },
    { name: 'weekToDate'; href: string; type: 'ref' },
    { name: 'lastWeek'; href: string; type: 'ref' },
    { name: 'last7Days'; href: string; type: 'ref' },
    { name: 'monthToDate'; href: string; type: 'ref' },
    { name: 'lastMonth'; href: string; type: 'ref' },
    { name: 'yearToDate (limit=1000)'; href: string; type: 'ref' },
    { name: 'lastYear (limit=1000)'; href: string; type: 'ref' }
  ];
  type: 'obj';
};

export type HistoryQueryResponse = {
  href: string;
  is: 'obix:HistoryQueryOut';
  nodes: [
    {
      name: 'data';
      of: '#RecordDef obix:HistoryRecord';
      nodes: {
        nodes: [
          {
            name: 'timestamp';
            val: string;
            tz: string;
            type: 'abstime';
          },
          {
            name: 'value';
            val: string | number | boolean | null;
            type: string;
          }
        ];
        type: 'obj';
      }[];
      type: 'list';
    },
    {
      name: 'count';
      val: number;
      type: 'int';
    },
    {
      name: 'start';
      val: string;
      tz: string;
      type: 'abstime';
    },
    {
      name: 'end';
      val: string;
      tz: string;
      type: 'abstime';
    },
    {
      href: '#RecordDef';
      is: 'obix:HistoryRecord';
      nodes: [
        {
          name: 'timestamp';
          tz: string;
          type: 'abstime';
        },
        {
          name: 'value';
          unit: string;
          type: string;
        }
      ];
      type: 'obj';
    }
  ];
  type: 'obj';
};

export type HistoryRollupResponse = {
  href: string;
  is: 'obix:HistoryQueryOut';
  nodes: [
    {
      name: 'data';
      of: 'obix:HistoryRollupRecord';
      nodes: {
        nodes: [
          { name: 'start'; val: string; tz: string; type: 'abstime' },
          { name: 'end'; val: string; tz: string; type: 'abstime' },
          { name: 'count'; val: number; type: 'int' },
          { name: 'min'; val: number; type: 'real' },
          { name: 'max'; val: number; type: 'real' },
          { name: 'avg'; val: number; type: 'real' },
          { name: 'sum'; val: number; type: 'real' }
        ];
        type: 'obj';
      }[];
      type: 'list';
    },
    { name: 'count'; val: number; type: 'int' },
    { name: 'start'; val: string; tz: string; type: 'abstime' },
    { name: 'end'; val: string; tz: string; type: 'abstime' }
  ];
  type: 'obj';
};
