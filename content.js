// This script runs when a user visits YouTube
console.log("Spoiler Blocker extension loaded");

let foundCommentsSection = null;
let foundCommentsSelector = null;
let isProcessingHideComments = false;

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
      createShowCommentsButton(commentsSection);
      isProcessingHideComments = false;
      return true;
    }
  }
  
  isProcessingHideComments = false;
  return false;
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
    console.log('Show comments button clicked');
    
    if (foundCommentsSection) {
      foundCommentsSection.style.display = 'block';
      
      if (buttonContainer.parentNode) {
        buttonContainer.parentNode.removeChild(buttonContainer);
      }
      
      console.log('Comments shown by user action');
      showNotification('Comments are now visible');
    } else {
      console.error('Unable to find comments section to show');
      
      if (foundCommentsSelector) {
        const commentsSection = document.querySelector(foundCommentsSelector);
        if (commentsSection) {
          commentsSection.style.display = 'block';
          if (buttonContainer.parentNode) {
            buttonContainer.parentNode.removeChild(buttonContainer);
          }
          console.log('Comments found and shown by selector');
          showNotification('Comments are now visible');
        } else {
          showNotification('Error: Could not find comments to show');
        }
      }
    }
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

if (!hideComments()) {
  const initialHideAttempt = setInterval(() => {
    if (hideComments()) {
      clearInterval(initialHideAttempt);
    }
  }, 1000);
  
  setTimeout(() => {
    clearInterval(initialHideAttempt);
  }, 10000);
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
        hideComments();
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

showNotification('Comments hidden by Spoiler Blocker! Click the button to show them.');
