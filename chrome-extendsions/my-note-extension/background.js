// ---- 通用函数 ----
function saveNotesToFile() {
  chrome.storage.local.get({ notes: [] }, (result) => {
    if (result.notes.length === 0) {
      console.log('没有笔记可以保存。');
      return;
    }

    let content = '我的笔记 (自动保存)\n====================\n\n';
    result.notes.forEach(note => {
      content += `[${note.date}]\n${note.text}\n\n--------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
      url: url,
      filename: '我的笔记-关闭时保存.txt'
    }, () => {
      // 下载成功后，重置未保存状态
      chrome.storage.local.set({ hasUnsavedChanges: false });
    });
  });
}


// ---- 事件监听 ----

// 1. 插件安装时
chrome.runtime.onInstalled.addListener(() => {
  // 创建右键菜单
  chrome.contextMenus.create({
    id: "addNote",
    title: "添加到我的笔记",
    contexts: ["selection"]
  });
  // 初始化存储
  chrome.storage.local.set({ notes: [], hasUnsavedChanges: false });
});

// 2. 右键菜单点击时
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addNote" && info.selectionText) {
    chrome.storage.local.get({ notes: [] }, (result) => {
      const notes = result.notes;
      const newNote = {
        text: info.selectionText,
        date: new Date().toLocaleString()
      };
      notes.push(newNote);
      // 保存笔记，并标记为“有未保存的更改”
      chrome.storage.local.set({ notes: notes, hasUnsavedChanges: true }, () => {
        console.log("笔记已添加，状态：未保存");
      });
    });
  }
});

// 3. 监听窗口关闭事件 (关键逻辑)
chrome.windows.onRemoved.addListener((windowId) => {
  // 检查是否还有其他窗口存在
  chrome.windows.getAll({}, (windows) => {
    // 如果 windows.length 为 0，说明这是最后一个被关闭的窗口
    if (windows.length === 0) {
      console.log("最后一个窗口已关闭，检查是否有未保存的笔记...");
      // 检查是否有未保存的笔记
      chrome.storage.local.get({ notes: [], hasUnsavedChanges: true }, (result) => {
        if (result.notes.length > 0 && result.hasUnsavedChanges) {
          // 如果有，则创建桌面通知
          chrome.notifications.create('save-notes-notification', {
            type: 'basic',
            iconUrl: 'images/icon48.png',
            title: '您有未保存的笔记！',
            message: '浏览器即将关闭，您有一些笔记尚未保存。',
            buttons: [
              { title: '立即保存笔记' }
            ],
            requireInteraction: true // 让通知一直显示直到用户处理
          });
        }
      });
    }
  });
});

// 4. 监听通知按钮点击事件
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId === 'save-notes-notification' && buttonIndex === 0) {
    saveNotesToFile();
  }
});