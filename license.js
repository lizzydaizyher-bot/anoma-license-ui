const LICENSE_SERVER = "https://anoma-license-server.onrender.com";
const RECEIVER = "0x0729B8E35e63fE518d257e1D492286D74eD60169";

const PLAN_PRICE = {
  weekly: "0.001",
  lifetime: "0.002"
};
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("buyLicenseBtn").addEventListener("click", buyLicense);
});

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    const input = document.getElementById("tokenInput");
    if (input) input.value = token;
    console.log("token:", token);
  } else {
    console.warn("❌ wrong token.");
  }

  const buyBtn = document.getElementById("buyLicenseBtn");
  if (buyBtn) {
    buyBtn.addEventListener("click", buyLicense);
  } else {
    console.warn("Buy button not found.");
  }
});

async function buyLicense() {
  const token = document.getElementById("tokenInput").value.trim();
  const plan = document.getElementById("plan").value;
  const ethAmount = PLAN_PRICE[plan];

  if (!window.ethereum) return alert("Metamask is not installed!");
  if (!token) return alert("Please enter your token.");
  console.log("Buy License fonksiyonu çağrıldı.");

  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const sender = accounts[0];

    const tx = {
      from: sender,
      to: RECEIVER,
      value: (BigInt(parseFloat(ethAmount) * 1e18)).toString(16)
    };

    await ethereum.request({ method: "eth_sendTransaction", params: [tx] });

    const res = await fetch(`${LICENSE_SERVER}/add-license`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: sender,
        token: token,
        licenseType: plan
      })
    });

    const result = await res.json();
    if (result.success) {
      document.getElementById("result").innerText = "✅ License successfully activated!";
    } else {
      document.getElementById("result").innerText = "❌ License activation failed!";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("result").innerText = "❌ Transaction canceled or error occurred.";
  }
}
