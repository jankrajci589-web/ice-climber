const STORAGE_KEY = 'ice-climber-leaderboard';

const Leaderboard = {
  load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  save(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  },

  submit(entry) {
    // entry = { name, payout, level, multiplier, difficulty, date }
    const entries = this.load();
    entries.push(entry);
    entries.sort((a, b) => b.payout - a.payout);
    const top = entries.slice(0, 5);
    this.save(top);
    return top;
  },

  getTop() {
    return this.load();
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

export default Leaderboard;
