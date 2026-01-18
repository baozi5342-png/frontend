// 获取市场数据并展示
const fetchMarketData = async () => {
  try {
    const response = await fetch('/api/markets');
    const data = await response.json();

    const marketDataContainer = document.getElementById('market-data');
    const marketList = data.map(item => {
      return `<li>${item.symbol}: ${item.name} - ${item.enabled ? 'Active' : 'Inactive'}</li>`;
    }).join('');
    marketDataContainer.innerHTML = `<ul>${marketList}</ul>`;
  } catch (error) {
    console.error('Error fetching market data:', error);
  }
};

// 获取秒合约数据并展示
const fetchContractsData = async () => {
  try {
    const response = await fetch('/api/contracts');
    const data = await response.json();

    const contractsDataContainer = document.getElementById('contracts-data');
    const contractsList = data.map(item => {
      return `<li>Duration: ${item.duration}s - Profit: ${item.profit_rate}%</li>`;
    }).join('');
    contractsDataContainer.innerHTML = `<ul>${contractsList}</ul>`;
  } catch (error) {
    console.error('Error fetching contracts data:', error);
  }
};

// 页面加载时，获取市场和合约数据
window.onload = () => {
  fetchMarketData();
  fetchContractsData();
};
// 提现功能
const withdrawFunds = async () => {
  const amount = document.getElementById('amount').value;
  if (!amount || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  try {
    const response = await fetch('/api/withdraw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: amount }),
    });

    const result = await response.json();
    if (response.status === 200) {
      alert("Withdrawal successful!");
    } else {
      alert("Error: " + result.message);
    }
  } catch (error) {
    console.error("Error during withdrawal:", error);
    alert("Failed to withdraw.");
  }
};
