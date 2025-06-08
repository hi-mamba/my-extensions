const praises = [
    "太棒了！你真是个懂得照顾自己的小天才！",
    "为你点赞！身体会感谢你此刻的补水。",
    "真不错！离拥有水润皮肤又近了一步。",
    "坚持喝水，你就是最自律的崽！",
    "干得漂亮！健康生活就从这杯水开始。",
    "你太可爱了，连喝水都这么准时！",
    "好样的！这杯水是给身体最好的礼物。",
    "简直完美！又完成了一次补水任务。",
    "确认过眼神，是爱喝水的好孩子。",
    "继续保持！你的坚持会带来改变。",
    "哇！你喝水的样子一定很迷人。",
    "非常棒！为你的健康干杯！",
    "优秀！你的身体正在悄悄变好。",
    "你是最棒的！连喝水这件事都做得这么好。",
    "真了不起！健康习惯的又一次胜利。",
    "给你比心！记得要一直这样爱自己。",
    "赞！这杯水充满了对自己的关爱。",
    "做得好！每一次喝水都是在投资健康。",
    "满分表现！身体的活力值正在+1。",
    "你简直是自律的典范！太强了！"
];

const drinkTypes = ['喝热水', '喝开水', '喝凉茶', '喝水', '喝果汁', '喝牛奶', '喝豆浆', '喝咖啡', '喝茶', '喝酸奶', '喝豆浆', '喝椰奶', '喝杏仁奶','喝酒'];

// background.js (Service Worker)

// 定义定时器名称
const ALARM_NAME = "myReminderAlarm";

// 设置提醒函数
function setReminder(intervalMinutes, tipMessage) {
  // 清除旧的提醒（如果存在）
  chrome.alarms.clear(ALARM_NAME);

  // 设置新的提醒
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: 0.1, // 首次延迟，可以根据需要调整
    periodInMinutes: intervalMinutes
  });

  // 保存提示信息，以便在提醒触发时使用
  chrome.storage.sync.set({ 'currentTip': tipMessage }, () => {
    if (chrome.runtime.lastError) {
      console.error("保存提示信息失败:", chrome.runtime.lastError);
    } else {
      console.log(`提醒设置成功，间隔 ${intervalMinutes} 分钟，提示：${tipMessage}`);
      // 可以发送一个通知确认设置成功
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon48.png', // 确保你有这个图标
        title: '提醒已设置',
        message: `每 ${intervalMinutes} 分钟提醒一次。`
      });
    }
  });
}

// 移除提醒函数
function removeReminder() {
  chrome.alarms.clear(ALARM_NAME, (wasCleared) => {
    if (wasCleared) {
      console.log("提醒已移除。");
      chrome.storage.sync.remove('currentTip', () => { // 移除保存的提示信息
        if (chrome.runtime.lastError) {
          console.error("移除提示信息失败:", chrome.runtime.lastError);
        }
      });
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon48.png',
        title: '提醒已移除',
        message: '所有提醒已清除。'
      });
    } else {
      console.log("没有要移除的提醒。");
    }
  });
}

// 监听 alarm 触发事件
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    chrome.storage.sync.get('currentTip', (result) => {
      const drink = drinkTypes[Math.floor(Math.random() * drinkTypes.length)];
      const praises_str = praises[Math.floor(Math.random() * praises.length)];
      const tip = result.currentTip || "时间到了！"; // 默认提示
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon48.png', // 确保你有这个图标
        title: ''+drink,
        message: tip + praises_str
      });
      console.log("提醒触发：", tip);
    });
  }
});

// 监听来自 popup.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "setReminder") {
    setReminder(request.interval, request.tip);
    sendResponse({ status: "success" }); // 可以发送响应回 popup
  } else if (request.action === "removeReminder") {
    removeReminder();
    sendResponse({ status: "success" });
  }
});

// 确保初始加载时没有旧的未清除的提醒
chrome.alarms.getAll((alarms) => {
  const existingAlarm = alarms.find(a => a.name === ALARM_NAME);
  if (existingAlarm) {
    console.log("存在未清除的提醒，下次将按计划触发。");
  }
});