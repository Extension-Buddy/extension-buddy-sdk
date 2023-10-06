const BASE_URL = 'http://localhost:3000';
const API_BASE_URL = `${BASE_URL}/api/v1`;
const AU_TOKEN_KEY = 'auToken';

async function getFromLocalStorage(item) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(item, (data) => {
      if (data[item] !== undefined) {
        resolve(data[item]);
      } else {
        resolve(null);
      }
    });
  });
}

async function setInLocalStorage(hash) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(hash, () => {
      resolve(hash);
    });
  });
}

async function getAuToken() {
  let auToken = await getFromLocalStorage(`${AU_TOKEN_KEY}`);

  if (auToken === null) {
    const response = await fetch(`${API_BASE_URL}/create_au_token`);
    const data = await response.json();

    //TODO: catch errors
    auToken = data?.data?.au_token;

    await setInLocalStorage({
      [AU_TOKEN_KEY] : auToken,
    });
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
    const response = await fetch(`${this.API_URL}/user_status?au_token=${auToken}`);
    const data = await response.json();

    return data.data;
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
}
