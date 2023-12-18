// const BASE_URL = 'https://seahorse-app-m8ymy.ondigitalocean.app';
const BASE_URL = 'http://localhost:3000';
const API_BASE_URL = `${BASE_URL}/api/v1`;
const AU_TOKEN_KEY = 'auToken';
const USER_STATUS_KEY = 'userStatus';

async function getFromLocalStorage(key) {
  return new Promise((resolve, _) => {
    chrome.storage.local.get(key, async (data) => {
      const storedData = data[key];

      console.log(`getFromLocalStorage key: ${key}  - ${JSON.stringify(storedData, null, 2)}`)

      if (storedData && storedData.timestamp > Date.now()) {
        // Data is still valid
        resolve(storedData.value);
      } else {
        // Data has expired or doesn't exist
        await removeFromLocalStorage(key);
        resolve(null);
      }
    });
  });
}

async function setInLocalStorage(key, value, ttlInSeconds) {
  return new Promise((resolve, _) => {
    const expirationTime = Date.now() + ttlInSeconds * 1000;
    const dataWithTimestamp = { value, timestamp: expirationTime };
    const hash = { [key]: dataWithTimestamp };

    chrome.storage.local.set(hash, () => {
      resolve(hash);
    });
  });
}

async function removeFromLocalStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        console.log(`Evicting ${key} from local storage`)
        resolve();
      }
    });
  });
}

async function getAuToken() {
  let auToken = await getFromLocalStorage(AU_TOKEN_KEY);

  if (auToken === null) {
    const response = await fetch(`${API_BASE_URL}/create_au_token`, {
      method: 'GET',
    });

    const data = await response.json();

    //TODO: catch errors
    auToken = data?.data?.au_token;

    await setInLocalStorage(AU_TOKEN_KEY, auToken, 999_999_999_999);
  }

  return auToken;
}

class ExtensionBuddy {
  constructor(extensionToken) {
      this.API_URL = `${API_BASE_URL}/extension/${extensionToken}`;
      this.WEB_APP_URL = `${BASE_URL}/extension/${extensionToken}`;
      this.extensionToken = extensionToken;
  }

  async getUserStatus() {
    const auToken = await getAuToken();

    let hash = await getFromLocalStorage(USER_STATUS_KEY);
    if (hash !== null) {
      console.log(`User Status Cache - ${JSON.stringify(hash || {}, null, 2)}`)
      return hash;
    }

    console.log(`Fetching latest user status`)
    const response = await fetch(`${this.API_URL}/user_status?au_token=${auToken}`, {
      method: 'GET',
    });
    const data = await response.json();

    if (data?.data?.user?.email !== null) {
      console.log(`saving user to local storage - ${JSON.stringify(data, null, 2)}`)
      // Only store if valid payload is returned
      setInLocalStorage(USER_STATUS_KEY, data.data, 2 * 60);
    } else {
      console.log('skipping saving user to local storage')
    }

    return data.data;
  }

  async getPlanStatus(planKey) {
    if (!planKey) return undefined;

    const userStatus = await this.getUserStatus();
    const plans = userStatus?.plans || {};

    return plans[planKey];
  }

  async isExtensionEnabled() {
    const userStatus = await this.getUserStatus();
    return userStatus?.extension?.is_enabled || false;
  }

  async openPaymentPage() {
    // Dimensions for the new window
    const POPUP_WINDOW_HEIGHT = 900;
    const POPUP_WINDOW_WIDTH = 1000;

    const left = window.screenX * 0.2;
    const top = window.screenY  * 0.5;

    const auToken = await getAuToken();

    // Open the new window with the calculated position
    window.open(`${this.WEB_APP_URL}/pay?au_token=${auToken}`, 'mywindow', 'toolbar=no,location=no,directories=no,status=no,menubar=no,status=no,scrollbars=nno,resizable=no,width=' + POPUP_WINDOW_WIDTH + ',height=' + POPUP_WINDOW_HEIGHT + ',left=' + left + ',top=' + top);
  }

  async openManagePage() {
    // Dimensions for the new window
    const POPUP_WINDOW_HEIGHT = 900;
    const POPUP_WINDOW_WIDTH = 700;

    const left = window.screenX * 0.4;
    const top = window.screenY  * 0.5;

    const auToken = await getAuToken();

    window.open(`${this.WEB_APP_URL}/manage?au_token=${auToken}`, 'mywindow', 'toolbar=no,location=no,directories=no,status=no,menubar=no,status=no,scrollbars=nno,resizable=no,width=' + POPUP_WINDOW_WIDTH + ',height=' + POPUP_WINDOW_HEIGHT + ',left=' + left + ',top=' + top);
  }

  async logout() {
    // Clear au token storage
    await removeFromLocalStorage(AU_TOKEN_KEY);
    await removeFromLocalStorage(USER_STATUS_KEY);
  }
}
