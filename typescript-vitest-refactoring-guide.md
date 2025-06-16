# TypeScript & Vitest 初学者向けナレッジ: オブジェクト引数リファクタリング時のエラー対処法

## 概要
JavaScriptからTypeScriptに移行する際や、関数の引数を位置引数からオブジェクト引数に変更する際によく遭遇するエラーとその対処法をまとめました。

## 1. 位置引数からオブジェクト引数への変更

### Before (位置引数)
```typescript
// 定義
public async updateRecord(appId: AppID, recordId: number, record: Record) {
  // 実装
}

// 呼び出し
await sdk.updateRecord(123, 456, { name: "test" });
```

### After (オブジェクト引数)
```typescript
// 定義
public async updateRecord({
  app,
  id,
  record,
}: {
  app: AppID;
  id: number;
  record: Record;
}) {
  // 実装
}

// 呼び出し
await sdk.updateRecord({ app: 123, id: 456, record: { name: "test" } });
```

### メリット
- **明確性**: 引数名が明確で順序間違いを防げる
- **拡張性**: 新しいオプション引数を追加しやすい
- **一貫性**: REST APIクライアントなど他のライブラリと形式を揃えられる

## 2. TypeScript `exactOptionalPropertyTypes` エラーの対処

### 問題
TypeScriptの`exactOptionalPropertyTypes`設定が有効な場合、オプショナルプロパティに明示的に`undefined`を渡すとエラーになります。

```typescript
// ❌ エラーになる例
const params = {
  app: 123,
  id: 456,
  record: {},
  revision: undefined  // exactOptionalPropertyTypesでエラー
};
await client.updateRecord(params);
```

### 解決法: 条件分岐でundefinedを除外

```typescript
// ✅ 正しい対処法
public async updateRecord({
  app,
  id,
  record,
  revision,
}: {
  app: AppID;
  id: number;
  record: Record;
  revision?: string;
}) {
  const params: any = {
    app,
    id,
    record,
  };
  
  // undefinedの場合は含めない
  if (revision !== undefined) {
    params.revision = revision;
  }
  
  const res = await this.restApiClient.record.updateRecord(params);
  return res;
}
```

### なぜこのエラーが起きるのか
- `exactOptionalPropertyTypes: true`は、オプショナルプロパティに`undefined`を明示的に設定することを禁止する
- これにより、「プロパティが存在しない」と「プロパティが`undefined`」を区別できる
- 多くのAPIでは、プロパティが存在しない場合とundefinedの場合で動作が異なるため

## 3. Vitestでのテスト更新

### 問題
関数のシグネチャを変更した場合、テストも更新する必要があります。

```typescript
// ❌ 古いテスト（位置引数）
const result = await kintoneApiService.getRecords(appId, fields, query);
```

```typescript
// ✅ 新しいテスト（オブジェクト引数）
const result = await kintoneApiService.getRecords({ app: appId, fields, query });
```

### Vitestでの一括置換のコツ

1. **`replace_all`オプションの活用**
```typescript
// 同じパターンが複数ある場合
{ 
  "old_string": "getRecords(appId, fields, query)", 
  "new_string": "getRecords({ app: appId, fields, query })", 
  "replace_all": true 
}
```

2. **より具体的なコンテキストで個別置換**
```typescript
// 文脈が異なる場合は個別に
{
  "old_string": "const result = await kintoneApiService.getRecords(1);",
  "new_string": "const result = await kintoneApiService.getRecords({ app: 1 });"
}
```

## 4. TypeScript型定義のベストプラクティス

### オプション引数の定義
```typescript
// ✅ 推奨: デフォルト値を明示
public async getRecords({
  app,
  fields = [],      // デフォルト値を設定
  query = "",       // デフォルト値を設定
}: {
  app: AppID;
  fields?: string[];  // オプショナル
  query?: string;     // オプショナル
}) {
  // 実装
}
```

### 型安全性を保つポイント
```typescript
// ✅ 型を明確に定義
interface UpdateRecordParams {
  app: AppID;
  id: number;
  record: Record;
  revision?: string;
}

public async updateRecord(params: UpdateRecordParams) {
  // 実装
}
```

## 5. エラー対処のチェックリスト

### TypeScriptエラーが出た場合
1. `npm run typecheck`でエラー内容を確認
2. `exactOptionalPropertyTypes`関連の場合は条件分岐で回避
3. 型定義が正しいか確認

### テストエラーが出た場合
1. `npm test`でエラー内容を確認
2. 関数シグネチャの変更に合わせてテストを更新
3. モックの設定も必要に応じて更新

### ビルドエラーが出た場合
1. TypeScriptエラーを先に解決
2. `npm run build`で確認
3. 警告も可能な限り解決

## 6. 実際のエラー例と解決過程

### エラー例1: Vitestテストの更新漏れ
```bash
# エラーメッセージ
expected 1st "spy" call to have been called with [ Array(1) ]
- Expected: { "app": 123, "fields": ["field1", "field2"], "query": "status = 'completed' limit 500 offset 0" }
+ Received: { "app": undefined, "fields": [], "query": "limit 500 offset 0" }
```

**原因**: テストで古い位置引数を使用していた
**解決**: オブジェクト引数に変更

### エラー例2: TypeScriptの型エラー
```bash
# エラーメッセージ
error TS2379: Argument of type '{ app: AppID; id: number; record: Record; revision: string | undefined; }' 
is not assignable to parameter with 'exactOptionalPropertyTypes: true'
Type 'undefined' is not assignable to type 'Revision'
```

**原因**: `exactOptionalPropertyTypes`設定でundefinedを明示的に渡していた
**解決**: 条件分岐でundefinedを除外

## 7. 学習リソース

- **TypeScript Handbook**: exactOptionalPropertyTypesについて
- **Vitest Documentation**: テストの書き方とモック
- **実践**: 小さな関数から段階的にリファクタリング

## 8. まとめ

TypeScriptとVitestを使った開発では、以下の点に注意することで多くのエラーを回避できます：

1. **段階的なリファクタリング**: 一度に大きく変更せず、小さな単位で進める
2. **テストファーストの意識**: 関数のシグネチャを変更したらすぐにテストも更新
3. **TypeScript設定の理解**: `exactOptionalPropertyTypes`など、厳密な設定の意味を理解する
4. **エラーメッセージを読む**: TypeScriptとVitestのエラーメッセージは親切なので、よく読んで対処する

この知識を活用することで、TypeScriptとVitestを使った開発でよくあるエラーを効率的に解決できるようになります。