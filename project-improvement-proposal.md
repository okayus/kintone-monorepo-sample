# プロジェクト運用改善提案

## 現状の課題

### 1. 運用の複雑性
- プロジェクトルートからアプリIDディレクトリへ移動して作業する必要がある
- 各アプリIDディレクトリで個別に`npm install`を実行する必要がある
- ルートと各アプリディレクトリに同じpackage.jsonが重複している

### 2. コードの重複
以下のファイルが複数のプロジェクトで完全に重複している：
- `util/kintoneSdk.ts` （92行）
- `util/KintoneUtil.ts` （17行）
- `util/KintoneSdk.test.ts` （84行）
- `types/KintoneTypes.ts` （11行）

## 解決案

### 案1: npm workspacesを使用したモノレポ構成（推奨）

#### ディレクトリ構成
```
kintone-monorepo-sample/
├── package.json (ワークスペースルート)
├── kintone/
│   ├── kintone-common/  # 共通パッケージ
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   └── KintoneTypes.ts
│   │   │   └── util/
│   │   │       ├── kintoneSdk.ts
│   │   │       ├── KintoneUtil.ts
│   │   │       └── KintoneSdk.test.ts
│   │   └── tsconfig.json
│   ├── 1111/
│   │   └── postSlack.js  # 既存のJSファイル
│   ├── 1112/
│   │   └── postSlack.js
│   ├── 2222/
│   │   └── postSlack.js
│   └── 3333/    
│       ├── release/
│       │   └── postSlack.js  # 既存のJSファイル
│       ├── package.json      # アプリ共通の設定
│       ├── display-message/  # 名前を短縮
│       │   ├── package.json
│       │   ├── src/
│       │   └── vite.config.ts
│       └── extract-user-codes/
│           ├── package.json
│           ├── src/
│           └── vite.config.ts
└── gas/
```

この構成の特徴：
- 既存のkintoneディレクトリ構造を維持
- アプリIDごとのディレクトリ管理を継続
- 既存のJSファイルとTypeScriptプロジェクトの分離を保持
- 共通コードはkintone-commonパッケージに集約

#### 実装手順
1. ルートのpackage.jsonをワークスペース設定に変更
```json
{
  "name": "kintone-monorepo-sample",
  "private": true,
  "workspaces": [
    "kintone/kintone-common",
    "kintone/3333/display-message",
    "kintone/3333/extract-user-codes"
  ],
  "scripts": {
    "dev:display": "npm run dev -w @kintone-monorepo-sample/display-message",
    "dev:extract": "npm run dev -w @kintone-monorepo-sample/extract-user-codes",
    "build:all": "npm run build --workspaces --if-present",
    "test:all": "npm run test --workspaces --if-present",
    "install:all": "npm install"
  }
}
```

2. 共通パッケージの作成
```json
// kintone/kintone-common/package.json
{
  "name": "@kintone-monorepo-sample/kintone-common",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.ts",
  "exports": {
    "./types": "./src/types/index.ts",
    "./util": "./src/util/index.ts"
  }
}
```

3. 各アプリケーションで共通パッケージを利用
```json
// kintone/3333/display-message/package.json
{
  "name": "@kintone-monorepo-sample/display-message",
  "dependencies": {
    "@kintone-monorepo-sample/kintone-common": "workspace:*",
    // 既存の依存関係...
  }
}
```

4. TypeScriptの設定で共通パッケージをインポート
```typescript
// kintone/3333/display-message/src/index.tsx
import { KintoneTypes } from '@kintone-monorepo-sample/kintone-common/types';
import { kintoneSdk } from '@kintone-monorepo-sample/kintone-common/util';
```

#### メリット
- ✅ ルートディレクトリから全てのコマンドを実行可能
- ✅ 依存関係の一元管理
- ✅ 共通コードの再利用が簡単
- ✅ 一度の`npm install`で全てのパッケージをインストール
- ✅ 既存のディレクトリ構造への変更が最小限
- ✅ アプリIDベースの管理を維持できる

### 案2: 相対パスによる共通化（簡易版）

#### ディレクトリ構成
```
kintone-monorepo-sample/
├── kintone-shared/      # 共通コード
│   ├── types/
│   └── util/
├── kintone/
│   └── 3333/
│       ├── displayMessage/
│       │   └── src/
│       │       └── shared -> ../../../kintone-shared (シンボリックリンク)
│       └── extractUserCodesFromTable/
│           └── src/
│               └── shared -> ../../../kintone-shared (シンボリックリンク)
```

#### メリット
- ✅ 既存の構成を大きく変えずに実装可能
- ✅ 設定が簡単

#### デメリット
- ❌ TypeScriptの設定でパスマッピングが必要
- ❌ ビルド設定が複雑になる可能性

### 案3: Git Submoduleによる共通化

共通コードを別リポジトリとして管理し、各プロジェクトでsubmoduleとして参照

#### メリット
- ✅ バージョン管理が明確
- ✅ 独立したリリースサイクル

#### デメリット
- ❌ 運用が複雑
- ❌ 開発時の更新が煩雑

### 案4: ワークスペースの動的管理（発展版）

案1をさらに改良し、ワイルドカードを使用してワークスペースを動的に管理：

```json
{
  "name": "kintone-monorepo-sample",
  "private": true,
  "workspaces": [
    "kintone/kintone-common",
    "kintone/*/display-message",
    "kintone/*/extract-user-codes",
    "kintone/*/*-*"  // 将来の新規プロジェクトも自動的に含まれる
  ]
}
```

#### メリット
- ✅ 新しいアプリやプロジェクトが自動的にワークスペースに追加される
- ✅ package.jsonの更新頻度が減る
- ✅ より柔軟な構成が可能

## 推奨事項

**案1のnpm workspaces（既存構造維持版）を推奨します。**

理由：
1. 既存のkintoneディレクトリ構造を維持できる
2. 段階的な移行が可能
3. モダンなJavaScript開発の標準的な手法
4. npmの標準機能で追加ツール不要
5. VSCodeなどのIDEサポートが充実
6. CI/CDとの統合が容易

将来的に規模が拡大した場合は、案4の動的管理への移行も検討できます。

## 移行計画

### Phase 1: 準備（1週間）
- 現在のコードベースのバックアップ
- ワークスペース構成の設計確定
- 移行スクリプトの作成

### Phase 2: 共通パッケージの作成（1週間）
- kintone-commonパッケージの作成
- テストの移行と動作確認
- ドキュメントの整備

### Phase 3: 既存プロジェクトの移行（2週間）
- 1つのプロジェクトをパイロット移行
- 問題点の洗い出しと対応
- 残りのプロジェクトを順次移行

### Phase 4: 運用開始（継続）
- 開発者向けガイドラインの作成
- CI/CDパイプラインの更新
- 定期的なレビューと改善

## 期待される効果

1. **開発効率の向上**
   - ルートディレクトリからの一元的な操作
   - 共通コードの変更が即座に反映

2. **保守性の向上**
   - コード重複の解消
   - 依存関係の可視化

3. **品質の向上**
   - 共通コードのテストカバレッジ向上
   - 一貫性のあるコードベース

## 実際の開発フロー例

### 既存のTypeScriptプロジェクトの開発
```bash
# ルートディレクトリから操作
cd kintone-monorepo-sample

# 依存関係のインストール（初回のみ）
npm install

# display-messageの開発
npm run dev:display

# extract-user-codesのビルド
npm run build -w @kintone-monorepo-sample/extract-user-codes

# 全プロジェクトのテスト
npm run test:all
```

### 新しいTypeScriptプロジェクトの追加
```bash
# 例：3333アプリに新機能を追加
cd kintone/3333
mkdir user-management
cd user-management

# package.jsonを作成
npm init -y

# ルートのpackage.jsonのworkspacesに追加
# "kintone/3333/user-management" を追加

# 共通パッケージを依存関係に追加
npm install @kintone-monorepo-sample/kintone-common@workspace:*
```

## 注意事項

- 移行中は必ずバックアップを取る
- 段階的な移行を心がける
- チーム全体での合意形成が重要
- 既存の開発フローへの影響を最小限に抑える
- 既存のJSファイルはそのまま残し、必要に応じて徐々にTypeScript化