/**
 * 通知を表示する関数
 * @param {string} type - 通知タイプ (success, error, info)
 * @param {string} message - 表示するメッセージ
 */
export function sendNotification(type, message) {
  const notificationEl = document.createElement('div');
  notificationEl.className = `notification notification-${type}`;
  notificationEl.textContent = message;
  
  // スタイルを設定
  notificationEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  
  // タイプ別の背景色
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    info: '#2196F3'
  };
  notificationEl.style.backgroundColor = colors[type] || colors.info;
  
  document.body.appendChild(notificationEl);
  
  // 3秒後に自動的に削除
  setTimeout(() => {
    notificationEl.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(notificationEl);
    }, 300);
  }, 3000);
}

// アニメーション用のCSS追加
if (!document.getElementById('notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}