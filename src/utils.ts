import { API_BASE_URL, AU_TOKEN_KEY } from "./constants";

export const getFromLocalStorage = async (key: string): Promise<any> => {
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

export const setInLocalStorage = async (key: string, value: string, ttlInSeconds: number) => {
  return new Promise((resolve, _) => {
    const expirationTime = Date.now() + ttlInSeconds * 1000;
    const dataWithTimestamp = { value, timestamp: expirationTime };
    const hash = { [key]: dataWithTimestamp };

    chrome.storage.local.set(hash, () => {
      resolve(hash);
    });
  });
}
export const removeFromLocalStorage = async (key: string) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        console.log(`Evicting ${key} from local storage`)
        resolve(true);
      }
    });
  });
}

export const getAuToken = async (): Promise<string> => {
  let auToken = await getFromLocalStorage(AU_TOKEN_KEY);

  if (auToken === null) {
    const response = await fetch(`${API_BASE_URL}/create_au_token`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Extension Buddy could not get an AuToken');
    }

    const data = await response.json();

    auToken = data?.data?.au_token;

    await setInLocalStorage(AU_TOKEN_KEY, auToken as string, 999_999_999_999);
  }

  return auToken;
}
