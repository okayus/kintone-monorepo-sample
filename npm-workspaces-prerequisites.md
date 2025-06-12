# npm workspaces 前提知識ガイド

## 1. npm workspacesとは

npm workspaces は npm 7.0以降で利用可能な機能で、単一のトップレベル（ルート）のパッケージから複数のパッケージを管理するための仕組みです。

### 主な特徴
- **モノレポ（Monorepo）** の実現：複数の関連パッケージを1つのリポジトリで管理
- **依存関係の共有**：共通の依存関係はルートの`node_modules`にインストール
- **相互参照の簡易化**：ワークスペース内のパッケージ間で簡単に参照可能

## 2. package.json の重要な設定項目

### 2.1 基本構造
```json
{
  "name": "パッケージ名",
  "version": "バージョン番号",
  "private": true,  // 公開しないパッケージの場合true
  "type": "module", // ESモジュールを使用する場合
  "workspaces": [], // ワークスペースの定義
  "scripts": {},    // npmスクリプト
  "dependencies": {}, // 実行時の依存関係
  "devDependencies": {} // 開発時の依存関係
}
```

### 2.2 workspaces フィールド
```json
{
  "workspaces": [
    "packages/*",           // packagesディレクトリ内の全てのディレクトリ
    "apps/web",            // 特定のディレクトリ
    "kintone/*/src"        // パターンマッチング
  ]
}
```

### 2.3 private フィールド
- `"private": true` を設定することで、誤ってnpmレジストリに公開することを防ぐ
- ワークスペースのルートパッケージには必須

## 3. ワークスペース参照の方法

### 3.1 workspace プロトコル
```json
{
  "dependencies": {
    "@kintone-monorepo-sample/kintone-common": "workspace:*"
  }
}
```
- `workspace:*` は同じワークスペース内のパッケージを参照
- 常に最新のローカルバージョンを使用

### 3.2 インポート方法
```typescript
// TypeScript/JavaScript でのインポート
import { KintoneTypes } from '@kintone-monorepo-sample/kintone-common/types';
import { kintoneSdk } from '@kintone-monorepo-sample/kintone-common/util';
```

## 4. npmコマンドの使い方

### 4.1 ワークスペース全体のコマンド
```bash
# 全ワークスペースの依存関係をインストール
npm install

# 全ワークスペースでスクリプトを実行
npm run build --workspaces

# 条件付きで実行（スクリプトが存在する場合のみ）
npm run test --workspaces --if-present
```

### 4.2 特定のワークスペースでのコマンド
```bash
# -w フラグで特定のワークスペースを指定
npm run dev -w @kintone-monorepo-sample/display-message

# 特定のワークスペースに依存関係を追加
npm install axios -w @kintone-monorepo-sample/kintone-common

# 複数のワークスペースを指定
npm run build -w @kintone-monorepo-sample/display-message -w @kintone-monorepo-sample/extract-user-codes
```

### 4.3 ルートからのスクリプト実行
```json
// ルートのpackage.json
{
  "scripts": {
    "dev:display": "npm run dev -w @kintone-monorepo-sample/display-message",
    "dev:extract": "npm run dev -w @kintone-monorepo-sample/extract-user-codes",
    "build:all": "npm run build --workspaces --if-present"
  }
}
```

## 5. ディレクトリ構造の理解

### 5.1 node_modulesの仕組み
```
kintone-monorepo-sample/
├── node_modules/         # 共通の依存関係
│   ├── react/
│   ├── typescript/
│   └── .bin/            # 実行可能ファイル
├── kintone/
│   ├── kintone-common/
│   │   └── node_modules/ # 固有の依存関係（必要な場合）
│   └── 3333/
│       └── display-message/
│           └── node_modules/ # シンボリックリンク
```

### 5.2 パッケージ間の参照
- ワークスペース内のパッケージは`node_modules`にシンボリックリンクが作成される
- 開発中の変更が即座に反映される

## 6. TypeScript設定での注意点

### 6.1 tsconfig.json の設定
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@kintone-monorepo-sample/kintone-common/*": ["../../../kintone-common/src/*"]
    }
  }
}
```

### 6.2 型定義の共有
- 共通パッケージで型定義をエクスポート
- 各プロジェクトで型定義をインポートして使用

## 7. よくある課題と解決方法

### 7.1 依存関係の競合
- 問題：異なるバージョンの同じパッケージが必要な場合
- 解決：`overrides`フィールドを使用してバージョンを統一

```json
{
  "overrides": {
    "react": "^18.2.0"
  }
}
```

### 7.2 ビルド順序の制御
- 問題：パッケージ間に依存関係がある場合のビルド順序
- 解決：スクリプトで順序を明示的に指定

```json
{
  "scripts": {
    "build": "npm run build -w @kintone-monorepo-sample/kintone-common && npm run build -w @kintone-monorepo-sample/display-message"
  }
}
```

### 7.3 パスの解決
- 問題：相対パスが複雑になる
- 解決：TypeScriptのパスマッピングやバンドラーの設定を活用

## 8. ベストプラクティス

1. **命名規則の統一**
   - スコープ付きパッケージ名を使用（例：`@kintone-monorepo-sample/package-name`）
   - 一貫性のある命名規則を維持

2. **バージョン管理**
   - 共通パッケージのバージョンは慎重に管理
   - 破壊的変更は避ける

3. **ドキュメント化**
   - 各パッケージにREADMEを作成
   - 依存関係と使用方法を明記

4. **テスト戦略**
   - 共通パッケージは十分にテスト
   - 統合テストも実施

## 9. 移行時のチェックリスト

- [ ] Node.js のバージョンが 14.15.0 以上
- [ ] npm のバージョンが 7.0.0 以上
- [ ] ルートの package.json に `"private": true` を設定
- [ ] workspaces フィールドを正しく設定
- [ ] 各パッケージの package.json に name フィールドを設定
- [ ] 依存関係の整理（重複の削除）
- [ ] スクリプトの移行と動作確認
- [ ] CI/CD パイプラインの更新

## 10. 参考リンク

- [npm workspaces 公式ドキュメント](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [npm workspace プロトコル](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#workspaces)
- [Monorepo のベストプラクティス](https://monorepo.tools/)