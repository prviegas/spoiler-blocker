document.addEventListener('DOMContentLoaded', function() {
  const statusElement = document.getElementById('status');
  const toggleCommentsButton = document.getElementById('toggleComments');
  const openOptionsButton = document.getElementById('openOptions');
  
  // Check if we're on YouTube
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentUrl = tabs[0].url;
    
    if (!currentUrl.includes('youtube.com/watch')) {
      statusElement.textContent = 'Not on a YouTube video page';
      toggleCommentsButton.disabled = true;
      return;
    }
    
    // Check if current channel is a spoiler channel
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getStatus'}, function(response) {
      if (chrome.runtime.lastError) {
        statusElement.textContent = 'Error: Could not connect to page';
        return;
      }
      
      if (response && response.channelId) {
        chrome.storage.sync.get({spoilerChannels: [], onlySpoilerChannels: true}, function(items) {
          const isSpoilerChannel = items.spoilerChannels.some(ch => ch.id === response.channelId);
          
          if (isSpoilerChannel) {
            statusElement.textContent = `Current channel is in your spoiler list`;
            statusElement.style.backgroundColor = '#ffecb3';
          } else {
            statusElement.textContent = `Current channel is not in your spoiler list`;
            statusElement.style.backgroundColor = '#e8f5e9';
          }
          
          if (response.commentsHidden) {
            toggleCommentsButton.textContent = 'Show Comments';
          } else {
            toggleCommentsButton.textContent = 'Hide Comments';
          }
        });
      } else {
        statusElement.textContent = 'Could not detect channel';
      }
    });
  });
  
  // Handle toggle comments button
  toggleCommentsButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleComments'});
      window.close();
    });
  });
  
  // Handle open options button
  openOptionsButton.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
});