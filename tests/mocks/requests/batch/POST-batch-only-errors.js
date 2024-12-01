import { xml2js } from 'xml-js';

const responseData = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type='text/xsl' href='/obix/xsl'?>
<list of="obix:BatchOut" xmlns="http://obix.org/ns/schema/1.0" xsi:schemaLocation="http://obix.org/ns/schema/1.0 /obix/xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <err href="https://localhost:443/obix/config/Test/BooleanWritable2/out" is="obix:BadUriErr" display="/Test/BooleanWritable2/out"/>
    <err href="https://localhost:443/obix/config/Test/NumericWritable1/set" is="obix:BadUriErr" display="/Test/NumericWritable1/set"/>
</list>`;

export const postBatchResponse = xml2js(responseData, { compact: true });
export const postBatchPayload = `<list>
<uri is="obix:Read" val="https://localhost:443/obix/config/Test/BooleanWritable2/out/" >
</uri>
<uri is="obix:Invoke" val="https://localhost:443/obix/config/Test/NumericWritable1/set/">
    <real name="in" val="50" />
</uri>
</list>`;
