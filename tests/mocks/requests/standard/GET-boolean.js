import { xml2js } from 'xml-js';

const responseData = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type='text/xsl' href='/obix/xsl'?>
<bool val="false" href="https://localhost/obix/config/Test/BooleanWritable/out/" is="/obix/def/baja:StatusBoolean" display="false {ok} @ def" displayName="Out" icon="/ord?module://icons/x16/statusBoolean.png" range="https://localhost/obix/config/Test/BooleanWritable/out/~bool"
  xmlns="http://obix.org/ns/schema/1.0" xsi:schemaLocation="http://obix.org/ns/schema/1.0 /obix/xsd"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"></bool>`;

export const getBooleanResponse = xml2js(responseData, { compact: true });
