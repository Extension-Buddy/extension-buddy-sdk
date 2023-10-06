const extensionToken = "HUvqEArF7PVzSFGJ2cI0";

const sdk = new ExtensionBuddy(extensionToken);

// Get user data
sdk.getUserStatus().then((data) => {
    if (data?.status === 'active') {
        document.getElementById("paymentButton").style.display = "none";
        document.getElementById("manageButton").style.display = "inline";
    }
    
    document.getElementById("paidStatus").innerHTML = `${JSON.stringify(data, null, 2)}`;
});

// Payment button handler
document.getElementById("paymentButton").onclick = () => {
    sdk.openPaymentPage();
}

// Manage button handler
document.getElementById("manageButton").onclick = () => {
    // sdk.openManagementPage();
}
