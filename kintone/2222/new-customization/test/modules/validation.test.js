import { describe, it, expect } from 'vitest';
import { validateRecord, validateFieldByType } from '../../src/modules/validation.js';
import { kintoneType } from '@kintone-sample/common';

describe('validation module', () => {
  describe('validateRecord', () => {
    it('有効なレコードの場合はtrueを返す', () => {
      const record = {
        'タイトル': { value: 'テストタイトル' },
        'ステータス': { value: '未着手' },
        '期限日': { value: '2025-12-31' },
        '担当者': { value: [] }
      };
      
      const result = validateRecord(record);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    it('タイトルが空の場合はエラーを返す', () => {
      const record = {
        'タイトル': { value: '' },
        'ステータス': { value: '未着手' }
      };
      
      const result = validateRecord(record);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('タイトルは必須項目です');
    });

    it('タイトルが100文字を超える場合はエラーを返す', () => {
      const record = {
        'タイトル': { value: 'あ'.repeat(101) },
        'ステータス': { value: '未着手' }
      };
      
      const result = validateRecord(record);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('タイトルは100文字以内で入力してください');
    });

    it('期限日が過去の場合はエラーを返す', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const record = {
        'タイトル': { value: 'テスト' },
        'ステータス': { value: '未着手' },
        '期限日': { value: yesterday.toISOString().split('T')[0] }
      };
      
      const result = validateRecord(record);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('期限日は今日以降の日付を設定してください');
    });

    it('ステータスが進行中で担当者未設定の場合はエラーを返す', () => {
      const record = {
        'タイトル': { value: 'テスト' },
        'ステータス': { value: '進行中' },
        '担当者': { value: [] }
      };
      
      const result = validateRecord(record);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('ステータスが「進行中」の場合は担当者を設定してください');
    });

    it('ステータスが進行中で担当者設定済みの場合は有効', () => {
      const record = {
        'タイトル': { value: 'テスト' },
        'ステータス': { value: '進行中' },
        '担当者': { value: [{ code: 'user1', name: 'ユーザー1' }] }
      };
      
      const result = validateRecord(record);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateFieldByType', () => {
    describe('NUMBER型', () => {
      it('有効な数値はtrueを返す', () => {
        expect(validateFieldByType('123', kintoneType.NUMBER)).toBe(true);
        expect(validateFieldByType(123, kintoneType.NUMBER)).toBe(true);
      });

      it('数値以外はfalseを返す', () => {
        expect(validateFieldByType('abc', kintoneType.NUMBER)).toBe(false);
        expect(validateFieldByType('', kintoneType.NUMBER)).toBe(false);
      });

      it('最小値・最大値の制約をチェックする', () => {
        expect(validateFieldByType(50, kintoneType.NUMBER, { min: 0, max: 100 })).toBe(true);
        expect(validateFieldByType(-10, kintoneType.NUMBER, { min: 0 })).toBe(false);
        expect(validateFieldByType(150, kintoneType.NUMBER, { max: 100 })).toBe(false);
      });
    });

    describe('TEXT型', () => {
      it('有効なテキストはtrueを返す', () => {
        expect(validateFieldByType('テスト', kintoneType.SINGLE_LINE_TEXT)).toBe(true);
      });

      it('必須チェック', () => {
        expect(validateFieldByType('', kintoneType.SINGLE_LINE_TEXT, { required: true })).toBe(false);
        expect(validateFieldByType('テスト', kintoneType.SINGLE_LINE_TEXT, { required: true })).toBe(true);
      });

      it('最大文字数チェック', () => {
        expect(validateFieldByType('あいうえお', kintoneType.SINGLE_LINE_TEXT, { maxLength: 5 })).toBe(true);
        expect(validateFieldByType('あいうえおか', kintoneType.SINGLE_LINE_TEXT, { maxLength: 5 })).toBe(false);
      });

      it('正規表現パターンチェック', () => {
        expect(validateFieldByType('test@example.com', kintoneType.SINGLE_LINE_TEXT, { 
          pattern: '^[\\w\\.]+@[\\w\\.]+$' 
        })).toBe(true);
        expect(validateFieldByType('invalid-email', kintoneType.SINGLE_LINE_TEXT, { 
          pattern: '^[\\w\\.]+@[\\w\\.]+$' 
        })).toBe(false);
      });
    });

    describe('DATE型', () => {
      it('有効な日付はtrueを返す', () => {
        expect(validateFieldByType('2025-12-31', kintoneType.DATE)).toBe(true);
        expect(validateFieldByType('2025-12-31T10:00:00', kintoneType.DATETIME)).toBe(true);
      });

      it('無効な日付はfalseを返す', () => {
        expect(validateFieldByType('invalid-date', kintoneType.DATE)).toBe(false);
        expect(validateFieldByType('2025-13-40', kintoneType.DATE)).toBe(false);
      });

      it('必須チェック', () => {
        expect(validateFieldByType('', kintoneType.DATE, { required: true })).toBe(false);
        expect(validateFieldByType('', kintoneType.DATE, { required: false })).toBe(true);
      });
    });
  });
});