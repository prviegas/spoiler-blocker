// This script runs when a user visits YouTube
console.log("Spoiler Blocker extension loaded");

let foundCommentsSection = null;
let foundCommentsSelector = null;
let isProcessingHideComments = false;
let currentChannelId = null;
let commentsHidden = false;
let settings = {
  spoilerChannels: [],
  onlySpoilerChannels: true
};

function loadSettings() {
  chrome.storage.sync.get({
    spoilerChannels: [],
    onlySpoilerChannels: true
  }, function(items) {
    settings = items;
    
    if (location.href.includes('youtube.com/watch')) {
      detectChannelAndProcessComments();
    } else if (location.href.includes('youtube.com')) {
      // Process thumbnails on YouTube homepage, search results, etc.
      processThumbnails();
    }
  });
}

function detectChannelAndProcessComments() {
  currentChannelId = extractChannelIdFromPage();
  
  if (!currentChannelId) {
    setTimeout(detectChannelAndProcessComments, 500);
    return;
  }
  
  const isSpoilerChannel = settings.spoilerChannels.some(ch => ch.id === currentChannelId);
  
  if (!settings.onlySpoilerChannels || (settings.onlySpoilerChannels && isSpoilerChannel)) {
    hideComments();
  }
}

function extractChannelIdFromPage() {
  let channelId = null;
  
  const ownerElement = document.querySelector('#owner #channel-name a');
  if (ownerElement && ownerElement.href) {
    const match = ownerElement.href.match(/youtube\.com\/(channel|c|user|@)(\/|%2F)?([\w-]+)/i);
    if (match && match[3]) {
      channelId = match[3];
    }
  }
  
  return channelId;
}

function hideComments() {
  if (isProcessingHideComments) return false;
  
  isProcessingHideComments = true;
  
  const commentSelectors = [
    'ytd-comments#comments', 
    'ytd-item-section-renderer#sections', 
    '#comments', 
    '#comment-section',
  ];
  
  const existingButton = document.getElementById('spoiler-blocker-button-container');
  if (existingButton) {
    isProcessingHideComments = false;
    return true;
  }
  
  for (const selector of commentSelectors) {
    const commentsSection = document.querySelector(selector);
    if (commentsSection) {
      foundCommentsSection = commentsSection;
      foundCommentsSelector = selector;
      commentsSection.style.display = 'none';
      commentsHidden = true;
      createShowCommentsButton(commentsSection);
      isProcessingHideComments = false;
      return true;
    }
  }
  
  isProcessingHideComments = false;
  return false;
}

function showComments() {
  if (foundCommentsSection) {
    foundCommentsSection.style.display = 'block';
    commentsHidden = false;
    
    const buttonContainer = document.getElementById('spoiler-blocker-button-container');
    if (buttonContainer && buttonContainer.parentNode) {
      buttonContainer.parentNode.removeChild(buttonContainer);
    }
    
    showNotification('Comments are now visible');
    return true;
  } else if (foundCommentsSelector) {
    const commentsSection = document.querySelector(foundCommentsSelector);
    if (commentsSection) {
      commentsSection.style.display = 'block';
      commentsHidden = false;
      
      const buttonContainer = document.getElementById('spoiler-blocker-button-container');
      if (buttonContainer && buttonContainer.parentNode) {
        buttonContainer.parentNode.removeChild(buttonContainer);
      }
      
      showNotification('Comments are now visible');
      return true;
    }
  }
  
  showNotification('Error: Could not find comments to show');
  return false;
}

function toggleComments() {
  if (commentsHidden) {
    return showComments();
  } else {
    return hideComments();
  }
}

function createShowCommentsButton(commentsSection) {
  const existingContainer = document.getElementById('spoiler-blocker-button-container');
  if (existingContainer) {
    existingContainer.parentNode.removeChild(existingContainer);
  }
  
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'spoiler-blocker-button-container';
  buttonContainer.style.padding = '20px 0';
  buttonContainer.style.textAlign = 'center';
  buttonContainer.style.backgroundColor = '#f9f9f9';
  buttonContainer.style.borderRadius = '8px';
  buttonContainer.style.margin = '20px 0';
  buttonContainer.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
  
  const showCommentsButton = document.createElement('button');
  showCommentsButton.textContent = 'Show Hidden Comments';
  showCommentsButton.style.backgroundColor = '#065fd4';
  showCommentsButton.style.color = 'white';
  showCommentsButton.style.border = 'none';
  showCommentsButton.style.padding = '10px 20px';
  showCommentsButton.style.borderRadius = '4px';
  showCommentsButton.style.fontSize = '14px';
  showCommentsButton.style.fontWeight = 'bold';
  showCommentsButton.style.cursor = 'pointer';
  showCommentsButton.style.transition = 'background-color 0.2s';
  
  showCommentsButton.addEventListener('mouseover', () => {
    showCommentsButton.style.backgroundColor = '#0356c4';
  });
  
  showCommentsButton.addEventListener('mouseout', () => {
    showCommentsButton.style.backgroundColor = '#065fd4';
  });
  
  showCommentsButton.addEventListener('click', () => {
    showComments();
  });
  
  buttonContainer.appendChild(showCommentsButton);
  
  const warningText = document.createElement('p');
  warningText.textContent = 'Warning: Comments may contain spoilers';
  warningText.style.color = '#606060';
  warningText.style.fontSize = '12px';
  warningText.style.marginTop = '8px';
  buttonContainer.appendChild(warningText);
  
  commentsSection.parentNode.insertBefore(buttonContainer, commentsSection);
}

// New function to extract channel ID from thumbnail element
function getChannelIdFromThumbnail(thumbnailElement) {
  // Try to find channel link near the thumbnail
  let channelElement = null;
  
  // Navigate up to find the video container
  let container = thumbnailElement.closest('ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer');
  if (container) {
    // Look for channel name element which typically has a link
    channelElement = container.querySelector('#channel-name a, #text-container a, .ytd-channel-name a');
  }
  
  if (channelElement && channelElement.href) {
    const match = channelElement.href.match(/youtube\.com\/(channel|c|user|@)(\/|%2F)?([\w-]+)/i);
    if (match && match[3]) {
      return match[3];
    }
  }
  
  return null;
}

// New function to blur thumbnails from spoiler channels
function blurThumbnail(thumbnailElement, channelId) {
  // Skip if already processed
  if (thumbnailElement.hasAttribute('data-spoiler-processed')) {
    return;
  }
  
  // Mark as processed to avoid duplicate processing
  thumbnailElement.setAttribute('data-spoiler-processed', 'true');
  
  // Create overlay container
  const overlayContainer = document.createElement('div');
  overlayContainer.className = 'spoiler-blocker-overlay';
  overlayContainer.style.position = 'absolute';
  overlayContainer.style.top = '0';
  overlayContainer.style.left = '0';
  overlayContainer.style.width = '100%';
  overlayContainer.style.height = '100%';
  overlayContainer.style.display = 'flex';
  overlayContainer.style.justifyContent = 'center';
  overlayContainer.style.alignItems = 'center';
  overlayContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlayContainer.style.backdropFilter = 'blur(10px)';
  overlayContainer.style.zIndex = '10';
  overlayContainer.style.cursor = 'pointer';
  overlayContainer.style.transition = 'opacity 0.2s';
  
  // Create SPOILER text
  const spoilerText = document.createElement('div');
  spoilerText.textContent = 'SPOILER';
  spoilerText.style.color = 'white';
  spoilerText.style.fontSize = '18px';
  spoilerText.style.fontWeight = 'bold';
  spoilerText.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.8)';
  spoilerText.style.padding = '10px';
  
  // Unblur on click
  overlayContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    overlayContainer.style.opacity = '0';
    setTimeout(() => {
      if (overlayContainer.parentNode) {
        overlayContainer.parentNode.removeChild(overlayContainer);
      }
    }, 200);
  });

  overlayContainer.appendChild(spoilerText);
  
  // Make sure the thumbnail container has position relative
  const thumbnailContainer = thumbnailElement.closest('#thumbnail, .ytd-thumbnail');
  if (thumbnailContainer) {
    const currentPosition = window.getComputedStyle(thumbnailContainer).position;
    if (currentPosition === 'static') {
      thumbnailContainer.style.position = 'relative';
    }
    thumbnailContainer.appendChild(overlayContainer);
  }
}

// Process thumbnails on the page
function processThumbnails() {
  // Selectors that typically contain thumbnails
  const thumbnailContainers = document.querySelectorAll('ytd-thumbnail:not([hidden])');
  
  thumbnailContainers.forEach(thumbnail => {
    const channelId = getChannelIdFromThumbnail(thumbnail);
    
    if (channelId && settings.spoilerChannels.some(ch => ch.id === channelId)) {
      blurThumbnail(thumbnail, channelId);
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStatus') {
    sendResponse({
      channelId: currentChannelId,
      commentsHidden: commentsHidden
    });
  } else if (request.action === 'toggleComments') {
    toggleComments();
    sendResponse({ success: true });
  }
  return true;
});

function initializePage() {
  loadSettings();

  if (location.href.includes('youtube.com/watch')) {
    if (!detectChannelAndProcessComments()) {
      const initialHideAttempt = setInterval(() => {
        if (detectChannelAndProcessComments()) {
          clearInterval(initialHideAttempt);
        }
      }, 1000);
      
      setTimeout(() => {
        clearInterval(initialHideAttempt);
      }, 10000);
    }
  } else if (location.href.includes('youtube.com')) {
    processThumbnails();
    
    // Set up a mutation observer to handle dynamically loaded thumbnails
    setupThumbnailObserver();
  }
}

// Setup a mutation observer for dynamically loaded thumbnails
function setupThumbnailObserver() {
  const thumbnailObserver = new MutationObserver((mutations) => {
    let shouldProcessThumbnails = false;
    
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        shouldProcessThumbnails = true;
      }
    });
    
    if (shouldProcessThumbnails) {
      processThumbnails();
    }
  });
  
  // Target the main content area where new thumbnails would be loaded
  const contentArea = document.querySelector('#content, #page-manager');
  if (contentArea) {
    thumbnailObserver.observe(contentArea, { 
      childList: true, 
      subtree: true 
    });
  }
}

let previousUrl = location.href;
let urlChangeTimeout = null;
const urlObserver = new MutationObserver(() => {
  if (location.href !== previousUrl) {
    previousUrl = location.href;
    
    if (urlChangeTimeout) {
      clearTimeout(urlChangeTimeout);
    }
    
    urlChangeTimeout = setTimeout(() => {
      if (location.href.includes('youtube.com/watch')) {
        commentsHidden = false;
        foundCommentsSection = null;
        foundCommentsSelector = null;
        currentChannelId = null;
        detectChannelAndProcessComments();
      } else if (location.href.includes('youtube.com')) {
        processThumbnails();
      }
    }, 1000);
  }
});

urlObserver.observe(document, { subtree: true, childList: true });

let activeNotification = null;
let notificationTimeout = null;

function showNotification(message) {
  if (activeNotification) {
    document.body.removeChild(activeNotification);
    clearTimeout(notificationTimeout);
  }
  
  activeNotification = document.createElement('div');
  activeNotification.textContent = message;
  activeNotification.style.position = 'fixed';
  activeNotification.style.bottom = '20px';
  activeNotification.style.right = '20px';
  activeNotification.style.backgroundColor = '#065fd4';
  activeNotification.style.color = 'white';
  activeNotification.style.padding = '10px 20px';
  activeNotification.style.borderRadius = '4px';
  activeNotification.style.zIndex = '9999';
  activeNotification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  activeNotification.style.transition = 'opacity 0.3s';
  
  document.body.appendChild(activeNotification);
  
  notificationTimeout = setTimeout(() => {
    activeNotification.style.opacity = '0';
    setTimeout(() => {
      if (activeNotification.parentNode) {
        document.body.removeChild(activeNotification);
        activeNotification = null;
      }
    }, 300);
  }, 3000);
}

initializePage();
