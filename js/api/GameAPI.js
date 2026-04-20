const GameAPI = {
  async startRound(betAmount, difficulty) {
    const res = await fetch('/round/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ betAmount, difficulty }),
    });
    if (!res.ok) throw new Error(`startRound failed: ${res.status}`);
    return res.json(); // { roundId, serverSeedHash }
  },

  async step(roundId) {
    const res = await fetch('/round/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roundId }),
    });
    if (!res.ok) throw new Error(`step failed: ${res.status}`);
    return res.json(); // { result, level, multiplier, danger }
  },

  async cashout(roundId) {
    const res = await fetch('/round/cashout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roundId }),
    });
    if (!res.ok) throw new Error(`cashout failed: ${res.status}`);
    return res.json(); // { payout, multiplier, level, serverSeed, rollHistory }
  },
};

export default GameAPI;
