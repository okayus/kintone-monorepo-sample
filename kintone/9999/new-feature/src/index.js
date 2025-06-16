import { KintoneSdk } from '@kintone-sample/common';
import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import { getRecords } from './modules/sampleModule.js';

(() => {
  'use strict';

  kintone.events.on('app.record.detail.show', async (event) => {
    // Example: Using kintone global object directly
    const appId = kintone.app.getId();
    const recordId = kintone.app.record.getId();
    
    console.log('App ID:', appId, 'Record ID:', recordId);

      // Initialize KintoneRestAPIClient
  const client = new KintoneRestAPIClient();
  
  // Create KintoneSdk instance
  const sdk = new KintoneSdk(client);
    
    // Example: Using custom module with KintoneSdk
    try {
      await getRecords(event, sdk);
    } catch (error) {
      console.error('Failed to update record status:', error);
    }
    
    return event;
  });
})();
