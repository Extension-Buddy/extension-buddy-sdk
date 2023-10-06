// Config
let extensionCode = "test-extension";
let planID = 1;

var bb = new BrowserBill(extensionCode);

// Get user data
bb.getUser().then((data) => {
    // Change view based on payment status
    if (data.paid) {
        document.getElementById("paymentButton").style.display = "none";
        document.getElementById("manageButton").style.display = "inline";
        document.getElementById("paidStatus").innerHTML = "Paid! 🔥";
    }
});

// Payment button handler
document.getElementById("paymentButton").onclick = () => {
    bb.openPaymentPage(planID);
}

// Manage button handler
document.getElementById("manageButton").onclick = () => {
    bb.openManagementPage();
}
