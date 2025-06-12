# npm workspaces フラッシュカード

## 基本概念

### カード1
**Q: npm workspacesとは何ですか？**
**A: 単一のトップレベルのpackage.jsonから複数のパッケージを管理するnpmの機能。モノレポを実現するための仕組み。**

### カード2
**Q: npm workspacesを使用するための最小要件は？**
**A: Node.js 14.15.0以上、npm 7.0.0以上**

### カード3
**Q: workspacesフィールドにはどのような値を設定できますか？**
**A: ディレクトリパスの配列。ワイルドカード（*）も使用可能。例：["packages/*", "apps/web"]**

### カード4
**Q: 依存関係の巻き上げ（hoisting）とは？**
**A: 共通の依存関係をルートのnode_modulesに配置し、各ワークスペースから参照する仕組み。重複を避けてディスク容量を節約。**

## package.json設定

### カード5
**Q: ルートのpackage.jsonに必須の設定は？**
**A: "private": true と "workspaces": [] の2つ**

### カード6
**Q: workspace:*プロトコルの意味は？**
**A: 同じワークスペース内のパッケージの最新バージョンを参照する特別なプロトコル**

### カード7
**Q: workspace:プロトコルが使えない場合の代替案は？**
**A: file:プロトコルを使用。例：file:../../common-package**

### カード8
**Q: ワークスペースパッケージのnameフィールドの推奨形式は？**
**A: スコープ付きパッケージ名。例：@project-name/package-name**

## コマンド操作

### カード9
**Q: 特定のワークスペースでコマンドを実行する方法は？**
**A: npm run <command> -w <package-name> または npm run <command> --workspace=<package-name>**

### カード10
**Q: 全てのワークスペースでコマンドを実行する方法は？**
**A: npm run <command> --workspaces**

### カード11
**Q: スクリプトが存在する場合のみ実行するオプションは？**
**A: --if-present フラグ。例：npm run test --workspaces --if-present**

### カード12
**Q: 依存関係ツリーを確認するコマンドは？**
**A: npm ls <package-name>**

## TypeScript設定

### カード13
**Q: TypeScriptでワークスペースパッケージを解決するための設定は？**
**A: tsconfig.jsonのcompilerOptions.pathsにマッピングを追加**

### カード14
**Q: pathsマッピングの記述例は？**
**A: 
```json
"paths": {
  "@project/common": ["../common/src"],
  "@project/common/*": ["../common/src/*"]
}
```
**

### カード15
**Q: 共通パッケージのtsconfig.jsonに推奨される追加設定は？**
**A: "declaration": true と "declarationMap": true（型定義ファイルの生成）**

## トラブルシューティング

### カード16
**Q: EUNSUPPORTEDPROTOCOL エラーの原因と対処法は？**
**A: workspace:プロトコルがサポートされていない。file:プロトコルに変更するか、npmをアップデート**

### カード17
**Q: 既存のpackage-lock.jsonとの競合を解決する方法は？**
**A: 
1. 既存のnode_modulesとpackage-lock.jsonを削除
2. npm installを再実行
**

### カード18
**Q: ワークスペースの依存関係が解決されない場合の確認点は？**
**A: 
1. パッケージ名が正しいか
2. workspacesフィールドにパスが含まれているか
3. 各パッケージのpackage.jsonにnameフィールドがあるか
**

## ベストプラクティス

### カード19
**Q: 共通パッケージを作成する際の基準は？**
**A: 2つ以上のパッケージで使用される機能、または将来的に再利用される可能性が高い機能**

### カード20
**Q: ワークスペース構成でのディレクトリ命名規則は？**
**A: 
- 共通パッケージ: packages/またはshared/
- アプリケーション: apps/
- 明確で一貫性のある名前を使用
**

### カード21
**Q: 移行時の推奨アプローチは？**
**A: 
1. 小さな共通パッケージから開始
2. 段階的に移行
3. 各段階でテストを実行
4. ドキュメントを更新
**

### カード22
**Q: CI/CDでワークスペースを扱う際の注意点は？**
**A: 
- npm ciを使用（npm installより高速）
- キャッシュ戦略の最適化
- 並列ビルドの活用
**

## 高度な設定

### カード23
**Q: 動的なワークスペース設定の例は？**
**A: 
```json
"workspaces": [
  "packages/*",
  "apps/*/src"
]
```
ワイルドカードで将来の追加に対応**

### カード24
**Q: overridesフィールドの用途は？**
**A: ワークスペース全体で特定のパッケージバージョンを強制する。依存関係の競合解決に使用。**

### カード25
**Q: プライベートパッケージとパブリックパッケージの混在方法は？**
**A: 各パッケージのpackage.jsonで個別に"private": true/falseを設定。ルートは必ずprivate: true。**