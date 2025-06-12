# プロジェクト運用の改善

## 概要
現在kintoneのカスタマイズJavaScriptファイルやkintoneとgoogleスプレッドシートの連携gasのJavaScriptファイルなどを単一リポジトリで管理している
kintoneのカスタマイズJavaScriptファイルはアプリID別に作成されているディレクトリ配下にされている（例：kintone/1111/postSlack.js）
最近kintoneのカスタマイズ開発にTypeScript,Vite,Vitestを導入しましたが、その運用に課題がある

### 現在の運用
1. 既存のjsファイルとtsプロジェクトを分けるため、既存のjsはreleaseディレクトリを作成し、移行する（例：kintone/3333/release/postSlack.js）
2. アプリIDのディレクトリにpackage.jsonを作成し、アプリIDのディレクトリに移動して`npm install`などのコマンド操作を行う（例：kintone/3333/）
3. ts用に新しいディレクトリを作成し、そこにsrcディレクトリとvite.config.tsなどを配置する（kintone/3333/extractUserCodesFromTable/）
4. 新しいカスタマイズ開発があれば3を行う（kintone/3333/displayMessage/）

### 課題
- プロジェクトルートディレクトリから、アプリIDディレクトリに移動して作業するなど運用が複雑
-  kintone/3333/displayMessage/src/util　や　kintone/3333/displayMessage/src/types　配下のファイルを再利用できていない

### 注意事項
このプロジェクトは実プロジェクトではなく、問題を提示するためのサンプルプロジェクト。

### 解決策
project-improvement-proposal.mdの案1を採用