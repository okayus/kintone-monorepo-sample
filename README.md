# kintone-monorepo-sample

kintoneカスタマイズ開発のモノレポ管理サンプル

## 概要

このリポジトリは、kintoneカスタマイズJavaScriptファイルをモノレポで効率的に管理するためのサンプルプロジェクトです。
既存のJavaScriptファイルを維持しながら、新規開発をモダンな環境（TypeScript/JavaScript + Vite + Vitest）で行う段階的移行アプローチを提案しています。

## 特徴

### 🔄 段階的移行アプローチ
- 既存JSファイルはそのまま維持
- 新規カスタマイズはモジュール形式で開発
- TypeScript、JavaScript両方に対応

### 📦 モノレポ構成
- npm workspacesによる統一管理
- 共通ライブラリ（kintone-common）の再利用
- アプリID別の整理された構造

### 🛠️ モダンな開発環境
- **Vite**: 高速ビルド・HMR対応
- **Vitest**: 高速ユニットテスト
- **TypeScript**: 型安全性（段階的導入可能）
- **ESModules**: モジュール化による保守性向上

### 🤝 既存コードとの共存
- 既存JSファイルから共通モジュールを利用可能
- UMD/ESM両形式での出力対応
- 学習コストを抑えた段階的導入

## ディレクトリ構造

```
kintone-monorepo-sample/
├── package.json                 # ルートpackage.json（workspaces設定）
├── kintone/
│   ├── kintone-common/         # 共通ライブラリ
│   │   ├── src/
│   │   │   ├── util/kintoneSdk.ts
│   │   │   └── types/KintoneTypes.ts
│   │   └── vite.config.ts
│   ├── 1111/                   # アプリID: 1111
│   │   └── postSlack.js        # 既存JSファイル
│   ├── 2222/                   # アプリID: 2222
│   │   ├── postSlack.js        # 既存JSファイル
│   │   └── new-customization/  # 新規モジュール形式
│   │       ├── src/index.js
│   │       ├── test/
│   │       └── vite.config.js
│   └── 3333/                   # アプリID: 3333（TypeScript例）
│       ├── release/postSlack.js # 既存JS（releaseディレクトリに移動）
│       ├── displayMessage/     # TypeScriptプロジェクト
│       └── extractUserCodesFromTable/
├── gas/                        # Google Apps Script
└── docs/                       # ドキュメント
```

## 使い方

### 1. セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/your-username/kintone-monorepo-sample.git
cd kintone-monorepo-sample

# 依存関係のインストール
npm install

# 共通ライブラリのビルド
cd kintone/kintone-common
npm run build
cd ../..
```

### 2. 新規カスタマイズの開発

```bash
# 新規プロジェクトの作成（アプリID: 4444の例）
mkdir -p kintone/4444/my-customization
cd kintone/4444/my-customization

# package.jsonの作成（テンプレートを参考に）
# vite.config.jsの作成
# src/index.jsの作成

# 開発開始
npm run dev  # ウォッチモード
npm run test # テスト実行
npm run build # 本番ビルド
```

### 3. 既存JSからの共通モジュール利用

```javascript
// 既存のJSファイル内で
const { KintoneSdk, KintoneUtil } = window.KintoneCommon;

// kintone REST APIクライアントと組み合わせて使用
const client = new KintoneRestAPIClient({/* 設定 */});
const sdk = new KintoneSdk(client);
```

## 開発パターン

### パターン1: JavaScript + モジュール（推奨）
新規開発者の学習コストを抑えつつ、モジュール化の恩恵を受ける

```javascript
// src/index.js
import { KintoneSdk, KintoneUtil } from '@kintone-sample/common';
import { validateRecord } from './modules/validation.js';

kintone.events.on('app.record.detail.show', (event) => {
  // ロジック
  return event;
});
```

### パターン2: TypeScript（段階的移行）
型安全性を重視する場合

```typescript
// src/index.tsx
import { KintoneSdk, KintoneUtil } from '@kintone-sample/common';
import type { KintoneEventObject } from '@kintone-sample/common';

kintone.events.on('app.record.detail.show', (event: KintoneEventObject) => {
  // 型安全なロジック
  return event;
});
```

## 利用可能なコマンド

```bash
# 全ワークスペースのビルド
npm run build:all

# 全ワークスペースのテスト実行
npm run test:all

# 特定ワークスペースでの作業
npm run dev -w @kintone-sample/display-message
npm run test -w @kintone-sample/app-2222-new-customization
```

## 課題と解決策

### 従来の課題
- ✗ プロジェクトルートから各アプリディレクトリに移動して作業
- ✗ 共通ロジックの重複実装
- ✗ テストの未実装
- ✗ ビルドプロセスの複雑さ

### 解決策
- ✅ npm workspacesによる統一管理
- ✅ kintone-commonによる共通化
- ✅ Vitestによる単体テスト
- ✅ Viteによる高速ビルド

## サンプルコード

### 共通ライブラリの利用例

```javascript
import { KintoneSdk, KintoneUtil, kintoneType } from '@kintone-sample/common';

// フィールド値の取得
const title = KintoneUtil.getFieldValue(record, 'タイトル');

// バリデーション
const isValid = validateFieldByType(value, kintoneType.NUMBER, { min: 0, max: 100 });

// REST API操作
const sdk = new KintoneSdk(client);
const apps = await sdk.getApps();
```

### ユニットテストの例

```javascript
import { describe, it, expect } from 'vitest';
import { validateRecord } from '../src/modules/validation.js';

describe('validation', () => {
  it('有効なレコードの場合はtrueを返す', () => {
    const record = { 'タイトル': { value: 'テスト' } };
    const result = validateRecord(record);
    expect(result.isValid).toBe(true);
  });
});
```

## ドキュメント

- [新規カスタマイズ開発ガイド](./新規カスタマイズ開発ガイド.md)
- [トラブルシューティング](./トラブルシューティング.md)
- [プロジェクト改善提案](./project-improvement-proposal.md)

## ライセンス

MIT License

## 貢献

Issue、Pull Requestを歓迎します。特に以下の改善案をお待ちしています：

- 新しい開発パターンの提案
- パフォーマンス改善
- ドキュメントの充実
- サンプルコードの追加

## 関連リソース

- [kintone JavaScript/CSS カスタマイズ](https://cybozu.dev/ja/kintone/docs/javascript/)
- [kintone REST API](https://cybozu.dev/ja/kintone/docs/rest-api/)
- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/)