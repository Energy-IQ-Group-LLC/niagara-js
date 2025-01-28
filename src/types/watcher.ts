import { ObixXmlFriendlyJSON } from './obix';

export type LeaseResponse = {
  val: string;
  href: string;
  display: string;
  displayName: 'Default Lease Time';
  writable: boolean;
  type: 'reltime';
};

export type WatchCreateResponse = {
  href: string;
  is: 'obix:Watch';
  display: 'Obix Watch';
  nodes: [
    {
      name: 'lease';
      val: string;
      href: string;
      display: string;
      displayName: 'Lease';
      writable: boolean;
      type: 'reltime';
    },
    {
      name: 'add';
      href: string;
      in: 'obix:WatchIn';
      out: 'obix:WatchOut';
      type: 'op';
    },
    {
      name: 'remove';
      href: string;
      in: 'obix:WatchIn';
      out: 'obix:Nil';
      type: 'op';
    },
    {
      name: 'pollChanges';
      href: string;
      in: 'obix:Nil';
      out: 'obix:WatchOut';
      type: 'op';
    },
    {
      name: 'pollRefresh';
      href: string;
      in: 'obix:Nil';
      out: 'obix:WatchOut';
      type: 'op';
    },
    {
      name: 'delete';
      href: string;
      in: 'obix:Nil';
      out: 'obix:Nil';
      type: 'op';
    }
  ];
  type: 'obj';
};

export type WatcherResponse = {
  is: 'obix:WatchOut';
  nodes: [
    {
      name: 'values';
      of: 'obix:obj';
      nodes?: ObixXmlFriendlyJSON[];
      type: 'list';
    }
  ];
  type: 'obj';
};

export type WatcherNullResponse = {
  null: true;
  type: 'obj';
};
