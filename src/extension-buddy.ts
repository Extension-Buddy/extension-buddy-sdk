import { API_BASE_URL, AU_TOKEN_KEY, BASE_URL, USER_STATUS_CACHE_SECONDS, USER_STATUS_KEY } from "./constants";
import { GetPlanStatusProps } from "./types";
import { getAuToken, getFromLocalStorage, removeFromLocalStorage, setInLocalStorage } from "./utils";


export class ExtensionBuddy {
  API_URL: string;
  WEB_APP_URL: string;
  extensionToken: string;

  constructor(extensionToken: string) {
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

    if (!response.ok) {
      throw new Error('Extension Buddy could not get the user status');
    }

    const data = await response.json();

    if (data?.data?.user?.email !== null) {
      console.log(`saving user to local storage - ${JSON.stringify(data, null, 2)}`)
      // Only store if valid payload is returned
      setInLocalStorage(USER_STATUS_KEY, data.data, USER_STATUS_CACHE_SECONDS);
    } else {
      console.log('skipping saving user to local storage')
    }

    return data.data;
  }

  async getPlanStatus({ planKey } : GetPlanStatusProps) {
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

    const left = window.screenX * 0.3;
    const top = window.screenY  * 0.53;

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