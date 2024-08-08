/* global chrome */
// src/constants.ts
var BASE_URL = "https://extensionbuddy.com";
var API_BASE_URL = `${BASE_URL}/api/v1`;
var AU_TOKEN_KEY = "auToken";
var USER_STATUS_KEY = "userStatus";
var USER_STATUS_CACHE_SECONDS = 60 * 15;

// src/utils.ts
var getFromLocalStorage = async (key) => {
  return new Promise((resolve, _) => {
    chrome.storage.local.get(key, async (data) => {
      const storedData = data[key];
      if (storedData && storedData.timestamp > Date.now()) {
        resolve(storedData.value);
      } else {
        await removeFromLocalStorage(key);
        resolve(null);
      }
    });
  });
};
var setInLocalStorage = async (key, value, ttlInSeconds) => {
  return new Promise((resolve, _) => {
    const expirationTime = Date.now() + ttlInSeconds * 1e3;
    const dataWithTimestamp = { value, timestamp: expirationTime };
    const hash = { [key]: dataWithTimestamp };
    chrome.storage.local.set(hash, () => {
      resolve(hash);
    });
  });
};
var removeFromLocalStorage = async (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(true);
      }
    });
  });
};
var getAuToken = async () => {
  let auToken = await getFromLocalStorage(AU_TOKEN_KEY);
  if (auToken === null) {
    const response = await fetch(`${API_BASE_URL}/create_au_token`, {
      method: "GET"
    });
    if (!response.ok) {
      throw new Error("Extension Buddy could not get an AuToken");
    }
    const data = await response.json();
    auToken = data?.data?.au_token;
    await setInLocalStorage(AU_TOKEN_KEY, auToken, 999999999999);
  }
  return auToken;
};

// src/extension-buddy.ts
var ExtensionBuddy = class {
  API_URL;
  WEB_APP_URL;
  extensionToken;
  constructor(extensionToken) {
    this.API_URL = `${API_BASE_URL}/extension/${extensionToken}`;
    this.WEB_APP_URL = `${BASE_URL}/extension/${extensionToken}`;
    this.extensionToken = extensionToken;
  }
  async getUserStatus() {
    const auToken = await getAuToken();
    let hash = await getFromLocalStorage(USER_STATUS_KEY);
    if (hash !== null) {
      return hash;
    }
    const response = await fetch(`${this.API_URL}/user_status?au_token=${auToken}`, {
      method: "GET"
    });
    if (!response.ok) {
      throw new Error("Extension Buddy could not get the user status");
    }
    const data = await response.json();
    if (data?.data?.user?.email !== null) {
      setInLocalStorage(USER_STATUS_KEY, data.data, USER_STATUS_CACHE_SECONDS);
    } else {
    }
    return data.data;
  }
  async getPlanStatus({ planKey }) {
    const userStatus = await this.getUserStatus();
    const plans = userStatus?.plans || {};
    return plans[planKey];
  }
  async isExtensionEnabled() {
    const userStatus = await this.getUserStatus();
    return userStatus?.extension?.is_enabled || false;
  }
  async openPaymentPage() {
    const POPUP_WINDOW_HEIGHT = 900;
    const POPUP_WINDOW_WIDTH = 1e3;
    const left = window.screenX * 0.3;
    const top = window.screenY * 0.53;
    const auToken = await getAuToken();
    window.open(`${this.WEB_APP_URL}/pay?au_token=${auToken}`, "mywindow", "toolbar=no,location=no,directories=no,status=no,menubar=no,status=no,scrollbars=nno,resizable=no,width=" + POPUP_WINDOW_WIDTH + ",height=" + POPUP_WINDOW_HEIGHT + ",left=" + left + ",top=" + top);
  }
  async openManagePage() {
    const POPUP_WINDOW_HEIGHT = 900;
    const POPUP_WINDOW_WIDTH = 700;
    const left = window.screenX * 0.4;
    const top = window.screenY * 0.5;
    const auToken = await getAuToken();
    window.open(`${this.WEB_APP_URL}/manage?au_token=${auToken}`, "mywindow", "toolbar=no,location=no,directories=no,status=no,menubar=no,status=no,scrollbars=nno,resizable=no,width=" + POPUP_WINDOW_WIDTH + ",height=" + POPUP_WINDOW_HEIGHT + ",left=" + left + ",top=" + top);
  }
  async logout() {
    await removeFromLocalStorage(AU_TOKEN_KEY);
    await removeFromLocalStorage(USER_STATUS_KEY);
  }
};
