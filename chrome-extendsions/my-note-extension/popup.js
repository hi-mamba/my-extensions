document.addEventListener('DOMContentLoaded', () => {
  const notesContainer = document.getElementById('notes-container');
  const downloadBtn = document.getElementById('download-btn');
  const clearBtn = document.getElementById('clear-btn');

  // 加载并显示笔记 (无需修改)
  function loadNotes() {
    chrome.storage.local.get({ notes: [] }, (result) => {
      notesContainer.innerHTML = '';
      if (result.notes.length === 0) {
        notesContainer.textContent = '暂无笔记。请选中网页上的文字，然后右键添加。';
        return;
      }
      result.notes.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note-item';
        const textP = document.createElement('p');
        textP.textContent = note.text;
        const dateSpan = document.createElement('span');
        dateSpan.className = 'note-date';
        dateSpan.textContent = note.date;
        noteDiv.appendChild(textP);
        noteDiv.appendChild(dateSpan);
        notesContainer.appendChild(noteDiv);
      });
    });
  }

  // 下载按钮点击事件 (添加状态重置)
  downloadBtn.addEventListener('click', () => {
    chrome.storage.local.get({ notes: [] }, (result) => {
      if (result.notes.length === 0) {
        alert('没有笔记可以下载！');
        return;
      }
      let content = '我的笔记\n====================\n\n';
      result.notes.forEach(note => {
        content += `[${note.date}]\n${note.text}\n\n--------------------\n\n`;
      });
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({
        url: url,
        filename: '我的笔记.txt'
      }, () => {
        // 下载成功后，将未保存状态设置为 false
        chrome.storage.local.set({ hasUnsavedChanges: false }, () => {
          console.log("笔记已手动下载，状态更新为：已保存");
          alert('笔记已开始下载！');
        });
      });
    });
  });

  // 清空按钮点击事件 (添加状态重置)
  clearBtn.addEventListener('click', () => {
    if (confirm('确定要清空所有笔记吗？此操作不可撤销。')) {
      // 清空笔记，并重置未保存状态
      chrome.storage.local.set({ notes: [], hasUnsavedChanges: false }, () => {
        loadNotes(); // 重新加载，显示空状态
        alert('所有笔记已清空！');
      });
    }
  });

  loadNotes();
});