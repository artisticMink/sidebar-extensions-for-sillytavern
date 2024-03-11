# sidebar-extensions-for-sillytavern

### Manage Extension Settings

```javascript
// Load extension settings
const extensionSettingsManager = new ExtensionSettingsManager(extensionName, defaultSettings);
const extensionSettings = extensionSettingsManager.extensionSettings;

// Mount a specific characters settings object
extensionSettingsManager.swapToCharacter(characterId);

// Open 'Save Settings to Character' Popup
async function saveToCharacterHandle() {
    await extensionSettingsManager.showCopySettingsPopup();
    // ...
}
document.getElementById('#myButton').addEventListener('click',saveToCharacterHandle);

// Example for loading a characters extension settings when selected
function chatChangedHandle() {
    const characterName = extensionSettingsManager.swapToSelectedCharacter();
    // ...
}
eventSource.on(
    event_types.CHAT_CHANGED,
    chatChangedHandle,
);

// Mount initial extensions settings object
extensionSettingsManager.swapToGlobalSettings();
```

```javascript
const extensionContainer = new ExtensionContainer();

// Add the extension drawer
// The sidebar counter will be mounted if not alrady present
const extensionDrawer = await extensionContainer.mountExtensionDrawer('Awesome Extension');

// Append extension template
const html = await fetch(`${extensionFolderPath}/${templateName}.html`).then(response => response.text());
extensionDrawer.insertAdjacentHTML('beforeend', html);
```
