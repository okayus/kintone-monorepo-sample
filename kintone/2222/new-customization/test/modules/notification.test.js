import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sendNotification } from '../../src/modules/notification.js';

describe('notification module', () => {
  beforeEach(() => {
    // DOMをクリーンアップ
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('sendNotification', () => {
    it('success通知を表示できる', () => {
      sendNotification('success', 'テスト成功メッセージ');
      
      const notification = document.querySelector('.notification-success');
      expect(notification).toBeTruthy();
      expect(notification.textContent).toBe('テスト成功メッセージ');
      expect(notification.style.backgroundColor).toBe('rgb(76, 175, 80)');
    });

    it('error通知を表示できる', () => {
      sendNotification('error', 'エラーメッセージ');
      
      const notification = document.querySelector('.notification-error');
      expect(notification).toBeTruthy();
      expect(notification.textContent).toBe('エラーメッセージ');
      expect(notification.style.backgroundColor).toBe('rgb(244, 67, 54)');
    });

    it('info通知を表示できる', () => {
      sendNotification('info', '情報メッセージ');
      
      const notification = document.querySelector('.notification-info');
      expect(notification).toBeTruthy();
      expect(notification.textContent).toBe('情報メッセージ');
      expect(notification.style.backgroundColor).toBe('rgb(33, 150, 243)');
    });

    it('3秒後に通知が自動的に削除される', () => {
      sendNotification('success', 'テストメッセージ');
      
      expect(document.querySelector('.notification')).toBeTruthy();
      
      // 3秒経過
      vi.advanceTimersByTime(3000);
      
      // アニメーション完了まで待つ
      vi.advanceTimersByTime(300);
      
      expect(document.querySelector('.notification')).toBeFalsy();
    });

    it('複数の通知を同時に表示できる', () => {
      sendNotification('success', 'メッセージ1');
      sendNotification('error', 'メッセージ2');
      sendNotification('info', 'メッセージ3');
      
      const notifications = document.querySelectorAll('.notification');
      expect(notifications.length).toBe(3);
    });

    it('不明なタイプの場合はinfo色を使用する', () => {
      sendNotification('unknown', 'メッセージ');
      
      const notification = document.querySelector('.notification-unknown');
      expect(notification).toBeTruthy();
      expect(notification.style.backgroundColor).toBe('rgb(33, 150, 243)');
    });
  });
});