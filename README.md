# Spoiler Blocker Chrome Extension

![Version](https://img.shields.io/badge/version-1.2-blue)
![Platform](https://img.shields.io/badge/platform-Chrome-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

A Chrome extension that hides comments on YouTube videos to prevent spoilers, with an option to show them when desired.

<img src="images/icon128.png" alt="Spoiler Blocker Logo" width="128" height="128">

## Features

- 🚫 Automatically hides the comments section on YouTube videos
- 🔔 Shows a temporary notification when comments are hidden
- 👁️ Provides a "Show Hidden Comments" button to reveal comments when desired
- 📺 Works on all video pages across YouTube
- 🔄 Maintains functionality when navigating between videos
- 🛡️ Blurs thumbnails from channels marked as spoiler sources

## Installation

### Method 1: Local Installation (Development)
1. Download or clone this repository
   ```bash
   git clone https://github.com/prviegas/spoiler-blocker.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed!

## How to Use

### Basic Usage
1. Navigate to any YouTube video
2. The extension will automatically hide the comments section
3. A "Show Hidden Comments" button will appear where the comments section would normally be
4. Click the button to reveal comments when you're ready to view them
5. A notification will confirm when comments become visible

### Managing Spoiler Channels

The extension can be configured to only hide comments on specific channels:

1. Click on the Spoiler Blocker icon in your Chrome toolbar
2. In the settings panel that opens:
   - Toggle "Only block spoilers on selected channels" to enable/disable selective blocking
   - Add channels to your spoiler list by entering their channel ID or URL
   - Remove channels from your list by clicking the "X" next to their name

## Troubleshooting

- If comments are not being hidden, refresh the page or navigate away and back
- If thumbnails are not being blurred, ensure you've added the channel to your spoiler list
- For persistent issues, try disabling and re-enabling the extension

## Privacy

This extension:
- Does not collect or transmit any user data
- Only stores your spoiler channel preferences locally in your browser
- Does not modify any content other than hiding comments and blurring thumbnails