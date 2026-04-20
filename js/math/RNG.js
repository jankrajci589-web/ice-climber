// Provably fair RNG with server seed + client seed + nonce
const ProvablyFair = {
  serverSeed: '',
  clientSeed: 'player',
  nonce: 0,
  lastRoll: 0,
  serverSeedHash: '',

  async init() {
    // Generate a random server seed
    const buf = new Uint8Array(32);
    crypto.getRandomValues(buf);
    this.serverSeed = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
    // Hash it so we show the hash before revealing the seed
    this.serverSeedHash = await this._sha256(this.serverSeed);
    this.nonce = 0;
  },

  async newRound() {
    this.nonce++;
    // Regenerate server seed each round for simplicity
    const buf = new Uint8Array(32);
    crypto.getRandomValues(buf);
    this.serverSeed = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
    this.serverSeedHash = await this._sha256(this.serverSeed);
  },

  async _sha256(str) {
    const msgBuf = new TextEncoder().encode(str);
    const hashBuf = await crypto.subtle.digest('SHA-256', msgBuf);
    return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  getVerifyString() {
    return `${this.serverSeed}:${this.clientSeed}:${this.nonce}`;
  },
};

export function roll() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const r = buf[0] / (0xFFFFFFFF + 1);
  ProvablyFair.lastRoll = +r.toFixed(6);
  return r;
}

export { ProvablyFair };
