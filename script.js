let bets = {
    dunk: { for: 0, against: 0 },
    marathon: { for: 0, against: 0 }
  };
  
  function placeBet(goal, side) {
    bets[goal][side]++;
    updateOdds(goal);
    updateTotals();
  }
  
  function updateOdds(goal) {
    const total = bets[goal].for + bets[goal].against;
    const forPct = total === 0 ? 50 : Math.round((bets[goal].for / total) * 100);
    const againstPct = 100 - forPct;
  
    document.getElementById(`${goal}-odds`).textContent = `${forPct} / ${againstPct}`;
  }
  
  function updateTotals() {
    const dunkTotal = bets.dunk.for * 10 + bets.dunk.against * 10;
    const marathonTotal = bets.marathon.for * 10 + bets.marathon.against * 10;
    const charityTotal = (dunkTotal + marathonTotal) * 0.1;
  
    document.getElementById('dunk-total').textContent = dunkTotal;
    document.getElementById('marathon-total').textContent = marathonTotal;
    document.getElementById('charity-total').textContent = charityTotal.toFixed(2);
  }
  