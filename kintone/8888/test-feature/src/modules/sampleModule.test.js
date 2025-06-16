import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRecords } from './sampleModule.js';

// Mock KintoneRestAPIClient
vi.mock('@kintone/rest-api-client', () => ({
  KintoneRestAPIClient: vi.fn().mockImplementation(() => ({}))
}));

// Mock KintoneSdk
const mockGetRecords = vi.fn().mockResolvedValue({ records: [{ id: '1', record: { title: { value: 'Test' } } }] });

vi.mock('@kintone-sample/common', () => ({
  KintoneSdk: vi.fn().mockImplementation(() => ({
    getRecords: mockGetRecords
  })),
  setupKintoneMocks: vi.fn()
}));

describe('sampleModule', () => {
  beforeEach(() => {
    // テスト前にモックをリセット
    vi.clearAllMocks();
    
    // グローバルkintoneオブジェクトのモック
    global.kintone = {
      app: {
        getId: () => 1234,
        record: {
          getId: () => 5678
        }
      }
    };
  });

  it('should get records from kintone app', async () => {
    const mockEvent = { appId: 1234 };
    const mockSdk = {
      getRecords: mockGetRecords
    };
    
    const result = await getRecords(mockEvent, mockSdk);
    
    expect(mockSdk.getRecords).toHaveBeenCalledWith({ app: 1234 });
    expect(result).toEqual({ records: [{ id: '1', record: { title: { value: 'Test' } } }] });
  });
});
