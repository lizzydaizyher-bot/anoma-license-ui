const LICENSE_SERVER = "https://anoma-license-server.onrender.com";
const RECEIVER = "0x0729B8E35e63fE518d257e1D492286D74eD60169";

const PLAN_PRICE = {
  weekly: "0.0001",
  lifetime: "0.002"
};

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    const input = document.getElementById("tokenInput");
    if (input) input.value = token;
    console.log("✅ Token come:", token);
  } else {
    console.warn("❌ No token.");
  }

  const buyBtn = document.getElementById("buyLicenseBtn");
  if (buyBtn) {
    buyBtn.addEventListener("click", buyLicense);
  } else {
    console.warn("❌ Cannot find buy.");
  }
});

async function buyLicense() {
  const token = document.getElementById("tokenInput").value.trim();
  const plan = document.getElementById("plan").value;
  const ethAmount = PLAN_PRICE[plan];

  if (!window.ethereum) return alert("❌ Metamask no found!");
  if (!token) return alert("❌ Please put your token.");

  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const sender = accounts[0];

    const tx = {
      from: sender,
      to: RECEIVER,
      value: (BigInt(parseFloat(ethAmount) * 1e18)).toString(16)
    };

    const txHash = await ethereum.request({
      method: "eth_sendTransaction",
      params: [tx]
    });

    console.log("✅ TX gönderildi:", txHash);

    const res = await fetch(`${LICENSE_SERVER}/add-license`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: sender,
        token: token,
        licenseType: plan,
        txHash: txHash
      })
    });

    const result = await res.json();

    if (result.success) {
      document.getElementById("result").innerText = "✅ License succesfully activated!";
    } else {
      document.getElementById("result").innerText = "❌ Lisans activation failed.";
    }
  } catch (err) {
    console.error("❌ Hata:", err);
    document.getElementById("result").innerText = "❌ Process cancelled.";
  }
}
