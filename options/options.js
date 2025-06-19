// DOM elements
const channelInput = document.getElementById('channelInput');
const addChannelButton = document.getElementById('addChannel');
const channelList = document.getElementById('channelList');
const onlySpoilerChannelsCheckbox = document.getElementById('onlySpoilerChannels');
const saveButton = document.getElementById('save');
const statusElement = document.getElementById('status');

// Store for channels
let spoilerChannels = [];

// Load stored settings
function loadSettings() {
  chrome.storage.sync.get({
    spoilerChannels: [],
    onlySpoilerChannels: true
  }, function(items) {
    spoilerChannels = items.spoilerChannels;
    onlySpoilerChannelsCheckbox.checked = items.onlySpoilerChannels;
    displayChannelList();
  });
}

// Display the channel list
function displayChannelList() {
  channelList.innerHTML = '';
  
  if (spoilerChannels.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'empty-list';
    emptyItem.textContent = 'No spoiler channels added yet';
    channelList.appendChild(emptyItem);
    return;
  }
  
  spoilerChannels.forEach((channel, index) => {
    const channelItem = document.createElement('li');
    
    const channelInfo = document.createElement('div');
    channelInfo.className = 'channel-info';
    
    const channelName = document.createElement('span');
    channelName.className = 'channel-name';
    channelName.textContent = channel.name;
    
    const channelId = document.createElement('span');
    channelId.className = 'channel-id';
    channelId.textContent = channel.id;
    
    channelInfo.appendChild(channelName);
    channelInfo.appendChild(channelId);
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Remove';
    deleteButton.addEventListener('click', () => {
      removeChannel(index);
    });
    
    channelItem.appendChild(channelInfo);
    channelItem.appendChild(deleteButton);
    channelList.appendChild(channelItem);
  });
}

// Extract channel ID from a YouTube URL
function extractChannelId(input) {
  // Try to extract channel ID from various YouTube URL formats
  const patterns = [
    /youtube\.com\/channel\/([\w-]+)/i,       // Standard channel URL
    /youtube\.com\/c\/([\w-]+)/i,             // Custom channel URL
    /youtube\.com\/user\/([\w-]+)/i,          // User channel URL
    /youtube\.com\/@([\w-]+)/i                // Handle URL
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // If no pattern matches, assume it's already a channel ID
  return input.trim();
}

// Add a channel to the list
async function addChannel() {
  const input = channelInput.value.trim();
  if (!input) return;
  
  try {
    const channelId = extractChannelId(input);
    
    // Check if channel already exists
    if (spoilerChannels.some(ch => ch.id === channelId)) {
      showStatus('Channel already in list', 'error');
      return;
    }
    
    // Try to get channel name (ideally we would fetch from YouTube API, 
    // but for simplicity we'll use the ID as name)
    let channelName = channelId;
    
    // Add to the list
    spoilerChannels.push({
      id: channelId,
      name: channelName
    });
    
    // Clear input and update display
    channelInput.value = '';
    displayChannelList();
    showStatus('Channel added successfully');
  } catch (error) {
    showStatus('Error adding channel: ' + error.message, 'error');
  }
}

// Remove channel from the list
function removeChannel(index) {
  spoilerChannels.splice(index, 1);
  displayChannelList();
  showStatus('Channel removed');
}

// Save settings
function saveSettings() {
  chrome.storage.sync.set({
    spoilerChannels: spoilerChannels,
    onlySpoilerChannels: onlySpoilerChannelsCheckbox.checked
  }, function() {
    showStatus('Settings saved successfully');
  });
}

// Show status message
function showStatus(message, type = 'success') {
  statusElement.textContent = message;
  statusElement.className = type;
  
  setTimeout(() => {
    statusElement.textContent = '';
  }, 3000);
}

// Event listeners
addChannelButton.addEventListener('click', addChannel);
saveButton.addEventListener('click', saveSettings);

// Allow adding channels by pressing Enter
channelInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addChannel();
  }
});

// Load settings on page load
document.addEventListener('DOMContentLoaded', loadSettings);