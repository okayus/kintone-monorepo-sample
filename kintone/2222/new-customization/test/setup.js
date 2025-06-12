// グローバルなkintoneオブジェクトをモック
global.kintone = {
  app: {
    getId: () => '2222',
    getFieldElements: () => ({})
  },
  events: {
    on: (event, handler) => {
      // テスト用のイベントハンドラー登録
    }
  }
};

// KintoneRestAPIClientのモック
global.KintoneRestAPIClient = class {
  constructor(options) {
    this.options = options;
    this.app = {
      getApps: async () => ({ apps: [] })
    };
    this.record = {
      getRecords: async (params) => ({ records: [] }),
      addRecord: async (params) => ({ id: '1', revision: '1' }),
      updateRecord: async (params) => ({ revision: '2' })
    };
  }
};

// sessionStorageのモック
global.sessionStorage = {
  getItem: (key) => null,
  setItem: (key, value) => {},
  removeItem: (key) => {},
  clear: () => {}
};