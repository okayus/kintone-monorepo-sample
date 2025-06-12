import { KintoneUtil, kintoneType } from '@kintone-sample/common';

/**
 * レコードのバリデーションを実行
 * @param {Object} record - kintoneレコードオブジェクト
 * @returns {{isValid: boolean, message: string}} バリデーション結果
 */
export function validateRecord(record) {
  // タイトルの必須チェック
  const title = KintoneUtil.getFieldValue(record, 'タイトル');
  if (!title || title.trim() === '') {
    return {
      isValid: false,
      message: 'タイトルは必須項目です'
    };
  }
  
  // タイトルの文字数チェック
  if (title.length > 100) {
    return {
      isValid: false,
      message: 'タイトルは100文字以内で入力してください'
    };
  }
  
  // 期限日の妥当性チェック
  const dueDate = KintoneUtil.getFieldValue(record, '期限日');
  if (dueDate) {
    const dueDateObj = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDateObj < today) {
      return {
        isValid: false,
        message: '期限日は今日以降の日付を設定してください'
      };
    }
  }
  
  // ステータスと担当者の整合性チェック
  const status = KintoneUtil.getFieldValue(record, 'ステータス');
  const assignee = record['担当者'];
  
  if (status === '進行中' && (!assignee || !assignee.value || assignee.value.length === 0)) {
    return {
      isValid: false,
      message: 'ステータスが「進行中」の場合は担当者を設定してください'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
}

/**
 * フィールドタイプに応じたバリデーション
 * @param {any} fieldValue - フィールドの値
 * @param {string} fieldType - フィールドタイプ
 * @param {Object} options - バリデーションオプション
 * @returns {boolean} バリデーション結果
 */
export function validateFieldByType(fieldValue, fieldType, options = {}) {
  switch (fieldType) {
    case kintoneType.NUMBER:
      const num = Number(fieldValue);
      if (isNaN(num)) return false;
      if (options.min !== undefined && num < options.min) return false;
      if (options.max !== undefined && num > options.max) return false;
      return true;
      
    case kintoneType.SINGLE_LINE_TEXT:
    case kintoneType.MULTI_LINE_TEXT:
      if (options.required && !fieldValue) return false;
      if (options.maxLength && fieldValue.length > options.maxLength) return false;
      if (options.pattern && !new RegExp(options.pattern).test(fieldValue)) return false;
      return true;
      
    case kintoneType.DATE:
    case kintoneType.DATETIME:
      if (!fieldValue) return !options.required;
      const date = new Date(fieldValue);
      return !isNaN(date.getTime());
      
    default:
      return true;
  }
}