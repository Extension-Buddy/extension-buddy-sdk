const extensionToken = "cgWFjYzLrXcIYhYlscFn"; // API Extender
const planToken = "VrSGP7WCWct5jXdKkQnh";  // Gold Plan

const sdk = new ExtensionBuddy(extensionToken);

// debugging
// sdk.logout();

// Get user data
sdk.getUserStatus().then((data) => {
    if (!data?.logged_in) {
        return;
    }

    if (data?.status === 'active') {
        document.getElementById("paymentButton").style.display = "none";
    }

    if (data?.status === 'not_active') {
        document.getElementById("paymentButton").innerText = "Purchase";
    }

    document.getElementById("manageButton").style.display = "inline";
    document.getElementById("logoutButton").style.display = "inline";
    sdk.getPlanStatus(planToken).then(planData => {
        document.getElementById("paidStatus").innerHTML = `${data?.status} -- ${JSON.stringify(planData, null, 2)}`;
    });
});

// Payment button handler
document.getElementById("paymentButton").onclick = () => {
    sdk.openPaymentPage();
}

// Manage button handler
document.getElementById("manageButton").onclick = () => {
    sdk.openManagePage();
}

document.getElementById("logoutButton").onclick = () => {
    sdk.logout();
    window.close()
}
