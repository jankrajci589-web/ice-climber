const WalletAPI = {
  walletUrl: null,
  token: null,
  enabled: false,

  init() {
    const params = new URLSearchParams(window.location.search);
    this.walletUrl = params.get('walletUrl')?.replace(/\/$/, '');
    this.token = params.get('token');
    this.enabled = !!(this.walletUrl && this.token);
  },

  async getBalance() {
    const res = await fetch(`${this.walletUrl}/balance?token=${encodeURIComponent(this.token)}`);
    if (!res.ok) throw new Error(`Balance fetch failed: ${res.status}`);
    const data = await res.json();
    return +data.balance;
  },

  async debit(amount, roundId) {
    const res = await fetch(`${this.walletUrl}/debit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: this.token, amount, roundId }),
    });
    if (!res.ok) throw new Error(`Debit failed: ${res.status}`);
    const data = await res.json();
    return +data.balance;
  },

  async credit(amount, roundId) {
    const res = await fetch(`${this.walletUrl}/credit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: this.token, amount, roundId }),
    });
    if (!res.ok) throw new Error(`Credit failed: ${res.status}`);
    const data = await res.json();
    return +data.balance;
  },
};

export default WalletAPI;
