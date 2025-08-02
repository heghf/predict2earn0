const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(user => {
  if (user) {
    loadCoins(user.uid);
    createGameGrid(user.uid);
  }
});

function loadCoins(uid) {
  db.collection('users').doc(uid).get().then(doc => {
    const coins = doc.exists ? doc.data().coins : 0;
    document.getElementById('coinCount').textContent = coins;
  });
}

function updateCoinsOnClick(uid, delta) {
  const ref = db.collection('users').doc(uid);
  ref.get().then(doc => {
    const newCoins = (doc.data().coins || 0) + delta;
    ref.update({ coins: newCoins }).then(() => loadCoins(uid));
  });
}

function createGameGrid(uid) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  const values = Array(36).fill('💣');
  for (let i = 0; i < 10; i++) {
    const rand = Math.floor(Math.random() * 36);
    values[rand] = '💎';
  }

  values.forEach((value, index) => {
    const box = document.createElement('div');
    box.classList.add('box');
    box.addEventListener('click', () => {
      if (!box.classList.contains('revealed')) {
        box.classList.add('revealed');
        box.innerHTML = `<span>${value}</span>`;
        updateCoinsOnClick(uid, value === '💎' ? 10 : -20);
      }
    });
    grid.appendChild(box);
  });
}

document.getElementById('restartBtn').addEventListener('click', () => {
  const user = auth.currentUser;
  if (user) createGameGrid(user.uid);
});
