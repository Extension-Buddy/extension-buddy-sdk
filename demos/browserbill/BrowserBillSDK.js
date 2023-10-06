async function storageGet(item) {
  return new Promise((resolve, reject) => {
      chrome.storage.local.get(item, function(data) {
          if(data[item] != undefined)
              resolve(data[item]);
          else
              resolve({});
      });
  });
}

async function storageSet(data) {
  return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, function() {
          resolve('');
      });
  });
}

function generateID() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

class BrowserBill {
  constructor(id) {
      this.id = id;
      this.API_URL = `https://browserbill.com/api/ext/${id}`;
  }

  async getUserID() {
      let userID = await storageGet("bb_user_id");

      if (userID.length > 0) {
          return userID;
      } else {
          let newUserID = generateID();

          await storageSet({"bb_user_id": newUserID});
          return newUserID;
      }
  }

  async getUser() {
      let userID = await this.getUserID();
      let userData = await fetch(`${this.API_URL}/user?user_id=${userID}`);
      userData = await userData.json();

      return userData.result;
  }

  async openPaymentPage(planID) {
      let userID = await this.getUserID();

      let payData = await fetch(`${this.API_URL}/pay?user_id=${userID}&plan_id=${planID}`);
      payData = await payData.json();

      if (payData.success) {
          chrome.windows.create({
              url: payData.result.payment_link,
              type: "popup",
              focused: true,
              width: 500,
              height: 800,
              left: 450
          }); 
      } else {
          console.log(`Error opening payment page: ${payData.error}`);
      }
  }

  async openManagementPage() {
      let userID = await this.getUserID();

      let manageData = await fetch(`${this.API_URL}/getmanagelink?user_id=${userID}`);
      manageData = await manageData.json();

      if (manageData.success) {
          chrome.windows.create({
              url: manageData.result.manage_link,
              type: "popup",
              focused: true,
              width: 500,
              height: 800,
              left: 450
          }); 
      } else {
          console.log(`Error opening management page: ${manageData.error}`);
      }
  }

  async openLoginPage() {
      let userID = await this.getUserID();

      let loginData = await fetch(`${this.API_URL}/getloginlink?user_id=${userID}`);
      loginData = await loginData.json();

      if (loginData.success) {
          chrome.windows.create({
              url: loginData.result.login_link,
              type: "popup",
              focused: true,
              width: 500,
              height: 800,
              left: 450
          }); 
      } else {
          console.log(`Error opening login page: ${loginData.error}`);
      }
  }

  async logout() {
      let userID = await this.getUserID();
      let logoutData = await fetch(`${this.API_URL}/logout?user_id=${userID}`);
      logoutData = await logoutData.json();

      if (!logoutData.success) {
          console.log(`Error logging out: ${logoutData.error}`);
      }

      return logoutData.success;
  }
}
