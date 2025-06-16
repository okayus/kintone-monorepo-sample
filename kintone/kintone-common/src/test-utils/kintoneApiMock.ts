import { vi } from 'vitest';

/**
 * kintone APIのモック
 */
export const kintoneApiMock = {
  $PLUGIN_ID: 'test-plugin-id',

  // イベント関連
  events: {
    on: vi.fn(),
    off: vi.fn(),
  },

  // API関連
  api: vi.fn().mockImplementation((path, method, params) => {
    return Promise.resolve({});
  }),

  // プロキシ関連
  proxy: vi.fn().mockImplementation((url, method, headers, data) => {
    return Promise.resolve([{}, 200]);
  }),

  // プラグイン関連
  plugin: {
    app: {
      getConfig: vi.fn().mockReturnValue({ condition: '{}' }),
      setConfig: vi.fn(),
      proxy: vi.fn(),
    },
  },

  // アプリ関連
  app: {
    record: {
      get: vi.fn().mockReturnValue({ record: {} }),
      set: vi.fn(),
      getId: vi.fn().mockReturnValue(1),
      getFieldElement: vi.fn(),
      getSpaceElement: vi.fn().mockReturnValue(document.createElement('div')),
      setFieldShown: vi.fn(),
      getHeaderMenuSpaceElement: vi.fn().mockReturnValue(document.createElement('div')),
    },
    getFieldElements: vi.fn(),
    getHeaderSpaceElement: vi.fn().mockReturnValue(document.createElement('div')),
    getId: vi.fn().mockReturnValue(1),
    getQueryCondition: vi.fn().mockReturnValue(''),
    getQuery: vi.fn().mockReturnValue(''),
    getHeaderMenuSpaceElement: vi.fn().mockReturnValue(document.createElement('div')),
  },

  // モバイル関連
  mobile: {
    app: {
      record: {
        get: vi.fn().mockReturnValue({ record: {} }),
        set: vi.fn(),
        getId: vi.fn().mockReturnValue(1),
        getFieldElement: vi.fn(),
        getSpaceElement: vi.fn().mockReturnValue(document.createElement('div')),
        setFieldShown: vi.fn(),
      },
      getFieldElements: vi.fn(),
      getHeaderSpaceElement: vi.fn().mockReturnValue(document.createElement('div')),
      getId: vi.fn().mockReturnValue(null),
      getQueryCondition: vi.fn().mockReturnValue(''),
      getQuery: vi.fn().mockReturnValue(''),
    },
  },

  // ユーザー関連
  getLoginUser: vi.fn().mockReturnValue({
    id: '1',
    code: 'user',
    name: 'User Name',
  }),

  getUiVersion: vi.fn().mockReturnValue(2),
};

/**
 * KintoneRestAPIClient のモック
 */
export class KintoneRestAPIClientMock {
  record: any;
  app: any;

  constructor() {
    this.record = {
      getRecords: vi.fn().mockResolvedValue({
        records: [],
      }),
      updateRecord: vi.fn().mockResolvedValue({ revision: '2' }),
      addRecord: vi.fn().mockResolvedValue({ id: '1' }),
      updateRecordsStatus: vi.fn().mockResolvedValue({
        records: [{ id: '1', revision: '1' }],
      }),
      updateAllRecords: vi.fn().mockResolvedValue({
        records: [{ id: '1', revision: '2' }],
      }),
    };

    this.app = {
      getApps: vi.fn().mockResolvedValue({
        apps: [],
      }),
      getFormFields: vi.fn().mockResolvedValue({
        properties: {},
      }),
      getViews: vi.fn().mockResolvedValue({
        views: {},
      }),
    };
  }
}

/**
 * テストセットアップ用のヘルパー関数
 */
export function setupKintoneMocks() {
  // グローバルなkintoneオブジェクトを設定
  global.kintone = kintoneApiMock as any;
  
  // documentのモック（DOM操作用）
  if (typeof document === 'undefined') {
    global.document = {
      createElement: vi.fn().mockImplementation((tagName: string) => ({
        tagName: tagName.toUpperCase(),
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(),
      })),
    } as any;
  }
}

/**
 * kintoneイベントをモック
 */
export function mockKintoneEvent(eventType: string, record: any = {}) {
  return {
    type: eventType,
    record,
    appId: 1,
    recordId: 1,
  };
}