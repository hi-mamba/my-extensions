// popup.js

'use strict';

let setRemindButton = document.getElementById('setRemindButton');
let removeRemindButton = document.getElementById('removeRemindButton');

// 页面加载时获取并显示保存的设置
chrome.storage.sync.get(['interval', 'tip'], result => {
  let intervalInput = document.getElementById('interval');
  let tipInput = document.getElementById('tip');
  if (result.interval) {
    intervalInput.value = result.interval;
    tipInput.value = result.tip;
    console.info("Updated popup with saved settings.");
  }
});

setRemindButton.onclick = function(element) {
  let intervalInput = document.getElementById('interval'); // 使用不同的变量名避免混淆
  let tipInput = document.getElementById('tip');

  let interval = parseInt(intervalInput.value);
  let tip = tipInput.value;

  // 验证输入
  if (isNaN(interval) || interval <= 0) {
    alert('请输入有效的提醒间隔（分钟）！');
    return;
  }
  if (!tip.trim()) {
      alert('请输入提醒内容！');
      return;
  }

  // 保存设置到 storage
  chrome.storage.sync.set({ 'interval': interval, 'tip': tip }, () => {
    if (chrome.runtime.lastError) {
      console.error("保存设置失败:", chrome.runtime.lastError);
    } else {
      console.log("设置已保存。");
    }
  });

  // 发送消息到 Service Worker
  chrome.runtime.sendMessage({
    action: "setReminder",
    interval: interval,
    tip: tip
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("发送设置提醒消息失败:", chrome.runtime.lastError);
    } else if (response && response.status === "success") {
      console.log("提醒设置请求已发送到背景脚本。");
      // 可以关闭弹出窗口或提供用户反馈
      // window.close();
    }
  });
};

removeRemindButton.onclick = function(element) {
  // 发送消息到 Service Worker
  chrome.runtime.sendMessage({
    action: "removeReminder"
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("发送移除提醒消息失败:", chrome.runtime.lastError);
    } else if (response && response.status === "success") {
      console.log("提醒移除请求已发送到背景脚本。");
      // 可以在这里清空输入框，或提供用户反馈
      document.getElementById('interval').value = '';
      document.getElementById('tip').value = '';
    }
  });
};