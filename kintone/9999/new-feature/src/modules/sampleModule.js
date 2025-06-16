/**
 * Update record status using KintoneSdk
 * @param {object} event - app.record.detail.showイベントオブジェクト
 * @param {number} appId - The app ID
 */ 
export async function getRecords(event, sdk) {
  const result = await sdk.getRecords({app: event.appId});
  console.log('Record got:', result);
  
  return result;
}
