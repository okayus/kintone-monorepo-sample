/**
 * Get records from kintone app using KintoneSdk
 * @param {object} event - kintone event object
 * @param {KintoneSdk} sdk - KintoneSdk instance
 */
export async function getRecords(event, sdk) {
  const result = await sdk.getRecords({ app: event.appId });
  console.log('Records retrieved:', result);
  
  return result;
}
