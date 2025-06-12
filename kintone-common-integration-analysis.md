# kintone-commonモジュールの既存JSファイルからの利用方法検討

## 現状分析

### 1. kintone-commonの現在の構造とビルド設定

#### ディレクトリ構造
```
kintone-common/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── index.ts
│   │   └── KintoneTypes.ts
│   └── util/
│       ├── index.ts
│       ├── kintoneSdk.ts
│       ├── KintoneSdk.test.ts
│       └── KintoneUtil.ts
```

#### package.json設定
- **name**: `@kintone-monorepo-sample/kintone-common`
- **type**: `module` (ESモジュール形式)
- **exports**: TypeScriptファイルを直接エクスポート
- **ビルドスクリプト**: 現在なし（TypeScriptファイルを直接参照）

#### tsconfig.json設定
- **target**: `es2020`
- **module**: `es2015`
- **outDir**: `./dist` (設定されているが、ビルドスクリプトがない)

### 2. kintoneSdkモジュールのエクスポート方法

現在の実装では以下のようにエクスポートされています：

```typescript
// src/util/index.ts
export { KintoneSdk, kintoneType } from './kintoneSdk';
export { KintoneUtil } from './KintoneUtil';

// src/index.ts
export * from './types';
export * from './util';
```

主な機能：
- `KintoneSdk`クラス: kintone REST APIのラッパー
- `kintoneType`: フィールドタイプの型定義
- `KintoneUtil`: その他のユーティリティ関数

### 3. 既存のJSファイルからモジュールを読み込む際の課題

現在の構成では、以下の課題があります：

1. **ESモジュール形式のみ**: 既存のJSファイルは通常のスクリプトファイルとして実行される
2. **TypeScriptファイルの直接参照**: ブラウザでは実行できない
3. **依存関係**: `@kintone/rest-api-client`などの外部モジュールへの依存

### 4. 解決策：UMDビルドやグローバル変数として公開する方法

## 推奨される実装方法

### 方法1: UMDビルドの作成（推奨）

UMD（Universal Module Definition）形式でビルドすることで、既存のJSファイルからグローバル変数として利用可能になります。

#### 実装手順：

1. **Viteの設定追加**
```typescript
// kintone-common/vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'KintoneCommon',
      fileName: 'kintone-common',
      formats: ['umd', 'es']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {
          // 必要に応じて外部ライブラリのグローバル変数名を定義
        }
      }
    }
  }
});
```

2. **ビルドスクリプトの追加**
```json
// kintone-common/package.json
{
  "scripts": {
    "build": "vite build",
    "prepublishOnly": "npm run build"
  }
}
```

3. **既存JSファイルでの利用**
```javascript
// kintone/2222/postSlack.js
(function() {
  'use strict';
  
  // グローバル変数としてアクセス
  const { KintoneSdk, KintoneUtil } = window.KintoneCommon;
  
  // REST APIクライアントの初期化
  const client = new KintoneRestAPIClient({
    baseUrl: 'https://example.cybozu.com',
    auth: { apiToken: 'YOUR_API_TOKEN' }
  });
  
  // KintoneSdkの利用
  const sdk = new KintoneSdk(client);
  
  // 使用例
  kintone.events.on('app.record.index.show', async (event) => {
    const apps = await sdk.getApps();
    console.log('Apps:', apps);
    return event;
  });
})();
```

### 方法2: CDN配信用のスタンドアロンビルド

依存関係を含めたスタンドアロンビルドを作成し、CDNまたはkintoneのJSカスタマイズファイルとして配信：

```typescript
// kintone-common/vite.config.cdn.ts
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'KintoneCommon',
      fileName: 'kintone-common-standalone',
      formats: ['iife']
    },
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true
      }
    }
  }
});
```

### 方法3: 既存JSファイルのモジュール化（段階的移行）

既存のJSファイルを徐々にESモジュールに移行する方法：

```javascript
// kintone/2222/postSlack.mjs (拡張子を.mjsに変更)
import { KintoneSdk } from '@kintone-monorepo-sample/kintone-common';

// モジュールとして実装
export function setupPostSlack() {
  kintone.events.on('app.record.create.submit', async (event) => {
    // 処理
    return event;
  });
}
```

## 実装優先順位

1. **短期的解決策**: UMDビルドの作成（方法1）
   - 既存のJSファイルを変更せずに利用可能
   - ビルド設定の追加のみで対応可能

2. **中期的解決策**: CDN配信用ビルド（方法2）
   - 依存関係の管理が簡単
   - バージョン管理が容易

3. **長期的解決策**: 段階的なモジュール化（方法3）
   - 最もクリーンな実装
   - TypeScriptの恩恵を最大限に活用

## 次のステップ

1. kintone-commonにvite.config.tsを追加
2. ビルドスクリプトを設定
3. サンプルの既存JSファイルでテスト
4. ドキュメントの作成と共有