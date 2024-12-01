import { xml2js } from 'xml-js';

const responseData = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type='text/xsl' href='/obix/xsl'?>
<obj null="true" xmlns="http://obix.org/ns/schema/1.0" xsi:schemaLocation="http://obix.org/ns/schema/1.0 /obix/xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>`;

export const postWatcherRemoveResponse = xml2js(responseData, { compact: true });
export const postWatcherRemovePayload = `<obj>
<list>
  <uri val="/obix/config/Test/BooleanWritable/" />
</list>
</obj>`;
