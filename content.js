// This script runs when a user visits YouTube
console.log("Spoiler Blocker extension loaded");

// Variable to store the found comments section
let foundCommentsSection = null;
let foundCommentsSelector = null;

// Flag to track if we're currently processing a hideComments operation
let isProcessingHideComments = false;

// Function to hide comments section and add a show button
function hideComments() {
  // If we're already processing a hide operation, don't start another one
  if (isProcessingHideComments) {
    console.log('Already processing hideComments, skipping duplicate call');
    return false;
  }
  
  isProcessingHideComments = true;
  
  // YouTube's comments section has different selectors depending on the page
  const commentSelectors = [
    'ytd-comments#comments', // Main comments section
    'ytd-item-section-renderer#sections', // Alternative comments container
    '#comments', // Another possible selector
    '#comment-section', // Another possible selector
  ];
  
  // First, check if the button already exists
  const existingButton = document.getElementById('spoiler-blocker-button-container');
  if (existingButton) {
    console.log('Button container already exists, no need to hide comments again');
    isProcessingHideComments = false;
    return true;
  }
  
  // Try each selector
  for (const selector of commentSelectors) {
    const commentsSection = document.querySelector(selector);
    if (commentsSection) {
      // Store the found section and selector for later use
      foundCommentsSection = commentsSection;
      foundCommentsSelector = selector;
      
      // Hide the comments section
      commentsSection.style.display = 'none';
      
      // Create and insert the "Show Hidden Comments" button
      createShowCommentsButton(commentsSection);
      
      console.log('Comments hidden by Spoiler Blocker extension');
      isProcessingHideComments = false;
      return true;
    }
  }
  
  isProcessingHideComments = false;
  return false;
}

// Function to create and insert the "Show Hidden Comments" button
function createShowCommentsButton(commentsSection) {
  // Check if a button container already exists and remove it
  const existingContainer = document.getElementById('spoiler-blocker-button-container');
  if (existingContainer) {
    existingContainer.parentNode.removeChild(existingContainer);
  }
  
  // Create a container for the button
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'spoiler-blocker-button-container';
  buttonContainer.style.padding = '20px 0';
  buttonContainer.style.textAlign = 'center';
  buttonContainer.style.backgroundColor = '#f9f9f9';
  buttonContainer.style.borderRadius = '8px';
  buttonContainer.style.margin = '20px 0';
  buttonContainer.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
  
  // Create the button
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
  
  // Add hover effect
  showCommentsButton.addEventListener('mouseover', () => {
    showCommentsButton.style.backgroundColor = '#0356c4';
  });
  
  showCommentsButton.addEventListener('mouseout', () => {
    showCommentsButton.style.backgroundColor = '#065fd4';
  });
  
  // Add click event to show comments - FIXED VERSION
  showCommentsButton.addEventListener('click', () => {
    console.log('Show comments button clicked');
    
    // Show the comments section
    if (foundCommentsSection) {
      // Make sure to set display to block or '' to show it
      foundCommentsSection.style.display = 'block';
      
      // Remove the button container after showing comments
      if (buttonContainer.parentNode) {
        buttonContainer.parentNode.removeChild(buttonContainer);
      }
      
      console.log('Comments shown by user action');
      showNotification('Comments are now visible');
    } else {
      console.error('Unable to find comments section to show');
      
      // Try to re-find the comments section using the stored selector
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
  
  // Add button to container
  buttonContainer.appendChild(showCommentsButton);
  
  // Add warning message
  const warningText = document.createElement('p');
  warningText.textContent = 'Warning: Comments may contain spoilers';
  warningText.style.color = '#606060';
  warningText.style.fontSize = '12px';
  warningText.style.marginTop = '8px';
  buttonContainer.appendChild(warningText);
  
  // Add the container before the comments section
  commentsSection.parentNode.insertBefore(buttonContainer, commentsSection);
}

// Initial attempt to hide comments
if (!hideComments()) {
  // If comments are not found initially, try again after the page has loaded more content
  console.log('Comments not found initially, will try again soon');
  
  // Use mutation observer to detect when new elements are added to the page
  const observer = new MutationObserver((mutations) => {
    if (hideComments()) {
      // If we successfully hide comments, disconnect the observer
      observer.disconnect();
    }
  });

  // Start observing the document body for changes in the DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also try again after a delay as a fallback
  setTimeout(hideComments, 3000);
}

// Observer for navigation events in YouTube's single-page application
// This is needed because YouTube doesn't reload the page when navigating between videos
let previousUrl = location.href;
let urlChangeTimeout = null;
const urlObserver = new MutationObserver(() => {
  if (location.href !== previousUrl) {
    previousUrl = location.href;
    
    // Check if we're on a video page
    if (location.href.includes('youtube.com/watch')) {
      console.log('URL changed to a video page, checking for comments...');
      
      // Reset state
      foundCommentsSection = null;
      foundCommentsSelector = null;
      
      // Clear any pending timeout to avoid duplicate executions
      if (urlChangeTimeout) {
        clearTimeout(urlChangeTimeout);
      }
      
      // Try to hide comments immediately
      if (!hideComments()) {
        // If not found, try again after a short delay, but store the timeout ID
        urlChangeTimeout = setTimeout(() => {
          hideComments();
          urlChangeTimeout = null;
        }, 1000);
      }
    }
  }
});

// Start observing for URL changes
urlObserver.observe(document, { subtree: true, childList: true });

// Keep track of active notifications
let activeNotification = null;
let notificationTimeout = null;

// Function to show notification
function showNotification(message) {
  // If there's already an active notification, remove it
  if (activeNotification && activeNotification.parentNode) {
    document.body.removeChild(activeNotification);
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }
  }
  
  // Show a notification instead of an alert
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  notification.style.color = 'white';
  notification.style.padding = '10px 15px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '9999';
  notification.style.fontFamily = 'Arial, sans-serif';
  notification.style.fontSize = '14px';
  notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  document.body.appendChild(notification);
  
  // Store the active notification
  activeNotification = notification;

  // Remove the notification after 5 seconds
  notificationTimeout = setTimeout(() => {
    notification.style.transition = 'opacity 0.5s';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
        activeNotification = null;
      }
    }, 500);
  }, 5000);
}

// Show initial notification
showNotification('Comments hidden by Spoiler Blocker! Click the button to show them.');
