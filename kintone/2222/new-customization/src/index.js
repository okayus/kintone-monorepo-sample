import { KintoneSdk, KintoneUtil } from '@kintone-sample/common';
import { sendNotification } from './modules/notification.js';
import { validateRecord } from './modules/validation.js';

(() => {
  'use strict';

  // レコード詳細画面表示時のイベント
  kintone.events.on('app.record.detail.show', (event) => {
    const record = event.record;
    
    // KintoneUtilを使用してフィールド値を取得
    const status = KintoneUtil.getFieldValue(record, 'ステータス');
    const assignee = KintoneUtil.getUserName(record['担当者']);
    
    console.log(`ステータス: ${status}, 担当者: ${assignee}`);
    
    // ステータスに応じて通知を表示
    if (status === '完了') {
      sendNotification('success', 'このタスクは完了しています');
    }
    
    return event;
  });

  // レコード保存前のイベント
  kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], async (event) => {
    const record = event.record;
    
    // バリデーション実行
    const validationResult = validateRecord(record);
    if (!validationResult.isValid) {
      event.error = validationResult.message;
      return event;
    }
    
    // KintoneSdkを使用して関連レコードをチェック
    try {
      const client = new KintoneRestAPIClient({
        baseUrl: 'https://your-domain.cybozu.com',
        auth: { apiToken: sessionStorage.getItem('apiToken') || '' }
      });
      
      const sdk = new KintoneSdk(client);
      
      // 重複チェックの例
      const title = KintoneUtil.getFieldValue(record, 'タイトル');
      const existingRecords = await sdk.getRecords(
        kintone.app.getId(),
        `タイトル = "${title}" and $id != ${record.$id.value || 0}`
      );
      
      if (existingRecords.records.length > 0) {
        event.error = '同じタイトルのレコードが既に存在します';
        return event;
      }
    } catch (error) {
      console.error('API実行エラー:', error);
      event.error = 'システムエラーが発生しました';
    }
    
    return event;
  });
})();