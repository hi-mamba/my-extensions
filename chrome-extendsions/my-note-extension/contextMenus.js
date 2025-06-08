chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add-to-note",
    title: "添加到笔记",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "add-to-note") {
    const content = info.selectionText;

    const { fileName } = await chrome.storage.local.get({ fileName: "default_note.txt" });

    chrome.runtime.sendMessage({ action: "write-to-file", content, fileName });
  }
});
