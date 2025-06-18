# kintone カスタマイズ モノレポ

このプロジェクトは、kintoneのカスタマイズJavaScriptファイルとGoogleスプレッドシート連携のGASファイルを単一リポジトリで管理するモノレポです。

## プロジェクト構造

```
kintone-monorepo-sample/
├── kintone/
│   ├── kintone-common/          # 共通ライブラリ
│   ├── 2222/                    # アプリID: 2222
│   │   └── new-customization/   # カスタマイズプロジェクト
│   └── 3333/                    # アプリID: 3333
│       ├── displayMessage/      # TypeScriptプロジェクト
│       └── extractUserCodesFromTable/
├── gas/                         # Google Apps Script
├── scripts/                     # ビルド・開発用スクリプト
└── templates/                   # プロジェクトテンプレート
```

## セットアップ

```bash
# 依存関係のインストール
npm install
```

## 開発コマンド

### 新規カスタマイズの作成

```bash
# 新規カスタマイズプロジェクトを作成
npm run create-customization <app-id> <project-name>

# 例
npm run create-customization 5555 user-management
```

### 個別プロジェクトの操作

```bash
# 開発サーバー起動（ウォッチモード）
npm run dev <app-id> <project-name>

# ビルド
npm run build <app-id> <project-name>

# テスト実行（ウォッチモード）
npm run test <app-id> <project-name>

# テスト実行（一回実行）
npm run test <app-id> <project-name> -- --run

# ESLintチェック
npm run lint <app-id> <project-name>

# ESLint自動修正
npm run lint <app-id> <project-name> -- --fix

# Prettierフォーマット
npm run format <app-id> <project-name>
```

### 使用例

```bash
# プロジェクト作成
npm run create-customization 5555 user-management

# 開発
npm run dev 5555 user-management

# テスト
npm run test 5555 user-management

# ビルド
npm run build 5555 user-management

# コード整形
npm run format 5555 user-management
```

### 特定プロジェクトの直接操作（レガシー）

```bash
# displayMessageプロジェクトの開発
npm run dev:display

# extractUserCodesFromTableプロジェクトの開発
npm run dev:extract
```

### 全プロジェクト一括操作

```bash
# 全プロジェクトのビルド
npm run build:all

# 全プロジェクトのテスト
npm run test:all

# 全プロジェクトのESLintチェック
npm run lint:all

# 全プロジェクトの型チェック
npm run typecheck:all
```

## 新規カスタマイズプロジェクトの機能

`create-customization`コマンドで作成されるプロジェクトには以下が含まれます：

- **Vite**: 高速なビルドツール
- **Vitest**: テストフレームワーク
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマッター
- **@kintone-sample/common**: 共通ライブラリ
- **依存性注入パターン**: テストしやすい設計

### 作成されるファイル構造

```
kintone/<app-id>/<project-name>/
├── src/
│   ├── index.js                 # エントリーポイント
│   └── modules/
│       ├── sampleModule.js      # サンプルモジュール
│       └── sampleModule.test.js # テストファイル
├── dist/                        # ビルド出力
├── package.json
├── vite.config.js
├── vitest.setup.js
├── .eslintrc.cjs
├── .eslintignore
├── .prettierrc
└── .gitignore
```

## kintone-common（共通ライブラリ）

### 主な機能

- **KintoneSdk**: kintone REST APIのラッパー
  - `getRecords()`: レコード取得
  - `updateRecord()`: レコード更新
  - `getApps()`: アプリ一覧取得
  - その他のAPI操作

### 使用例

```javascript
import { KintoneSdk } from '@kintone-sample/common';
import { KintoneRestAPIClient } from '@kintone/rest-api-client';

// 初期化
const client = new KintoneRestAPIClient();
const sdk = new KintoneSdk(client);

// レコード取得
const records = await sdk.getRecords({ app: 123 });
```

## デプロイ

1. プロジェクトをビルド
   ```bash
   npm run build <app-id> <project-name>
   ```

2. `dist/bundle.iife.js`をkintoneにアップロード

### kintoneへのアップロード順序

1. kintone-common.umd.js（共通ライブラリ）
2. bundle.iife.js（カスタマイズコード）

## トラブルシューティング

### ESLintエラー

ルートプロジェクトのESLint設定との競合がある場合は、Prettierでの整形を推奨：

```bash
npm run format <app-id> <project-name>
```

### ビルドエラー

1. 依存関係の再インストール
   ```bash
   npm install
   ```

2. kintone-commonのリビルド
   ```bash
   cd kintone/kintone-common
   npm run build
   ```

## 開発のベストプラクティス

1. **新規開発は必ず`create-customization`を使用**
   - 統一された構造とツールチェーン
   - テスト環境の自動セットアップ

2. **コミット前の確認**
   ```bash
   npm run test <app-id> <project-name> -- --run
   npm run format <app-id> <project-name>
   npm run build <app-id> <project-name>
   ```

3. **共通ロジックは`kintone-common`へ**
   - 再利用可能なユーティリティ
   - 型定義の共有

## ライセンス

MIT License