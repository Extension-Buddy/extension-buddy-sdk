# SDK Functions (APIs)

Now that your have connected the Extension Buddy SDK client, it's time to do some magic. Here are the functions available with the SDK.

<hr>

## Functions

#### `getUserStatus()`

Check if the current user is logged in and has access to t he current extension. When this function is called, it will return an object detailing what access it has. This response could be used to handle complex access.

```javascript
const userStatus = await sdk.getUserStatus();

console.log(userStatus.logged_in); 
// true
```
<b>Response:</b>
```javascript
{
  "logged_in": true,
  "status": "active",
  "user": {
    "created_at": "2023-10-23T05:28:16.788Z",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@gmail.com"
  },
  "plans": {
    "plan_tBSO7SqIqkTeI9UzngFh": {
      "key": "plan_tBSO7SqIqkTeI9UzngFh",
      "name": "Test Plan",
      "type": "monthly",
      "is_active": true
    }
  }
}
```

`userStatus.status` can either be `"active"` | `"not_active"`. It will only be active if at least one plan is active.

<br>

<b>WARNING 🚨: This function will throw an error when there are failures.</b>

<br><br>

#### `getPlanStatus(planKey)`

Get the plan status for the current user, if the plan exists.

```javascript
const planKey = "plan_tBSO7SqIqkTeI9UzngFh";
const planStatus = await sdk.getPlanStatus(planKey);

console.log(planStatus.is_active); 
// true
```
<b>Response:</b>
```javascript
  {
    "key": "plan_tBSO7SqIqkTeI9UzngFh",
    "name": "Test Plan",
    "type": "monthly",
    "is_active": true
  }
```
<br>

<b>WARNING 🚨: This function will throw an error when there are failures.</b>

<br><br>

#### `openPaymentPage()`

Open the payment page allowing your user to purchase a subscription or log in if the user already purchased your extension. 

<b>Note:</b> This will open it's own window that the user can interact with.

<br>

<b>WARNING 🚨: This function will throw an error when there are failures.</b>

<br><br><br>

#### `openManagePage()` REQUIRED

Open the management page for users who are already subscribed to your extension. Here, users can view and/or cancel their subscriptions. Additionally, there is a subscritpion history.

<b>WARNING 🚨 : It is REQUIRED for you to give this option to your users. Failure to do so will result in your subscriptions cancelled and your account being closed.</b>

<br>

<b>WARNING 🚨: This function will throw an error when there are failures.</b>

<br><br><br>

#### `isExtensionEnabled()`

Boolean that indicates if the extension payments are enabled or disabled.

```javascript
const isEnabled = await sdk.isExtensionEnabled();

if (isEnabled) {
  await openPaymentPage();
} else {
  // toast to let user know payments disabled.
}
```
<b>Note:</b> Remember that users may want to login using `openPaymentPage()`.

<br>

<b>WARNING 🚨: This function will throw an error when there are failures.</b>

<br><br><br>

#### `logout()`

Log out the current user from your extension.