# npm workspaces 移行ガイド - 学習のまとめ

## 1. プロジェクト固有の実装内容

### 1.1 実施した移行作業
1. **共通パッケージの作成**
   - `kintone/kintone-common`ディレクトリを作成
   - 重複していたutil/typesファイルを共通パッケージに集約
   - package.jsonでエクスポート設定を定義

2. **ワークスペース構成の設定**
   - ルートのpackage.jsonにworkspacesフィールドを追加
   - 各サブプロジェクトを独立したパッケージとして設定
   - 既存のディレクトリ構造を維持しながら移行

3. **依存関係の修正**
   - 各プロジェクトで共通パッケージを参照
   - `workspace:*`プロトコルが使えない場合は`file:`プロトコルを使用
   - import文を相対パスから`@kintone-monorepo-sample/kintone-common`に変更

4. **不要ファイルの削除**
   - 重複したutil/typesディレクトリを削除
   - 競合するpackage.json/package-lock.jsonを削除

### 1.2 遭遇した問題と解決方法

**問題1: npm installでworkspace:プロトコルエラー**
- 原因：npm 10.8.2でworkspace:プロトコルが正しく動作しない
- 解決：`file:`プロトコルに変更（`file:../../kintone-common`）

**問題2: 既存のpackage.jsonとの競合**
- 原因：kintone/3333に既存のpackage.jsonが存在
- 解決：競合するファイルを削除してから再実行

## 2. 一般化された知識

### 2.1 モノレポ移行のベストプラクティス

#### 段階的アプローチ
1. **現状分析**
   - 重複コードの特定
   - 依存関係の把握
   - ディレクトリ構造の理解

2. **設計フェーズ**
   - 共通パッケージの範囲決定
   - ワークスペース構成の計画
   - 命名規則の統一

3. **実装フェーズ**
   - 共通パッケージの作成
   - ワークスペース設定
   - 依存関係の更新
   - import文の修正

4. **検証フェーズ**
   - ビルドの確認
   - テストの実行
   - 型チェックの確認

### 2.2 共通パッケージ設計の原則

**1. 単一責任の原則**
- 共通パッケージは明確な責任範囲を持つ
- 過度に大きな共通パッケージは避ける

**2. インターフェースの安定性**
- エクスポートするAPIは慎重に設計
- 破壊的変更を最小限に抑える

**3. バージョニング戦略**
- セマンティックバージョニングの遵守
- CHANGELOGの維持

### 2.3 トラブルシューティングガイド

**依存関係の問題**
```bash
# 依存関係ツリーの確認
npm ls <package-name>

# キャッシュクリアと再インストール
rm -rf node_modules package-lock.json
npm install
```

**パスの解決問題**
- TypeScriptのpathsマッピングを設定
- バンドラーの設定も同期させる

**ビルド順序の問題**
- 依存関係グラフを考慮したビルドスクリプト
- 共通パッケージを先にビルド

### 2.4 メンテナンス戦略

**1. ドキュメンテーション**
- 各パッケージにREADME.mdを作成
- APIドキュメントの自動生成
- 移行ガイドの作成

**2. CI/CDの更新**
- ワークスペース対応のビルドパイプライン
- 並列ビルドの活用
- キャッシュ戦略の最適化

**3. 開発者体験の向上**
- ルートからの一元的な操作
- 統一されたツールチェーン
- 明確なディレクトリ構造

## 3. npm workspacesの利点と注意点

### 利点
- **依存関係の一元管理**: 重複を避けてディスク容量を節約
- **開発効率の向上**: ルートから全ての操作が可能
- **コードの再利用**: 共通コードの簡単な共有
- **バージョンの整合性**: 依存関係のバージョン統一

### 注意点
- **初期設定の複雑さ**: 適切な構成には計画が必要
- **ビルドの複雑化**: 依存関係を考慮したビルド順序
- **npmバージョン**: 7.0以上が必要
- **エディタサポート**: パスの解決に追加設定が必要な場合

## 4. チェックリスト

### 移行前
- [ ] Node.js 14.15.0以上、npm 7.0以上の確認
- [ ] 重複コードの特定
- [ ] バックアップの作成
- [ ] 移行計画の策定

### 移行中
- [ ] 共通パッケージの作成
- [ ] ワークスペース設定
- [ ] 依存関係の更新
- [ ] import文の修正
- [ ] 不要ファイルの削除

### 移行後
- [ ] npm installの成功確認
- [ ] ビルドの動作確認
- [ ] テストの実行
- [ ] 型チェックの確認
- [ ] ドキュメントの更新