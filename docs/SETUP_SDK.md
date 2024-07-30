# Setup SDK

Now that the Extension Buddy SDK is integrated into your extension, it's time to set it up for use.
<hr>

## Storage Permissions

In order to use our SDK successfully, you <b>must</b> first add these permissions to your extension's `manifest.json` file.

```json
{
  "name": "Your Extension",
  ...
  "permissions": [
      "storage"
  ]
}
```

##  Get Your Extension Key
If you have already created an extension, login to your [Extension Buddy Dashboard](https://extensionbuddy.com/monetize/extensions)

- Click on your `Extension Name`
- Click on `Setup`
- Copy your `Extension Key`. 

<br>
This Extension Key will be used to connect the Extension Buddy SDK to your extension.

<b>Haven't created an extension yet? [Create one here](https://extensionbuddy.com/monetize/extensions/new).</b>

<br>
<br>

## Importing the Extension Buddy SDK

### Using `extension-buddy-sdk.js`
##### On a Pop-up page

When adding the Extension Buddy SDK to a pop up page, you should be sure to include the script in the html file.

```html
<!-- popup.html -->
<!DOCTYPE html>
<html>
    <head>
      ...
    </head>
    <body>
      ...
      <!-- Added here-->
      <script src="path/to/ExtensionBuddySDK.js"></script>
      <script src="popup.js"></script>
    </body>
</html>
```

##### On Background.js

To add the Extension Buddy SDK to a background script, you  will need to include the SDK in the `manifest.json` like this.

```json
  "background": {
    "scripts": [
      "path/to/ExtensionBuddySDK.js",    
    ],
  },
```

### Using `extension-buddy-sdk` npm package
```javascript
  import { ExtensionBuddy } from 'extension-buddy-sdk';
```

<br>
<br>

## Add the Extension Buddy SDK Client

Using your copied Extension Key, you can create an Extension Buddy SDK client instance. This can be created in your background.js or another javascript files.

```javascript
// This is your extension key from the Extension Dashboard
const extensionToken = 'extension_key';

// Now we can use 'sdk' to perform everything we need.
const sdk = new ExtensionBuddy(extensionToken);
```
