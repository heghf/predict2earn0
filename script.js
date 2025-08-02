// --- Firebase and UI logic from index.html ---
const firebaseConfig = {
  apiKey: "AIzaSyDHpvvfei0TkP6c7YlSe_RawuqwCrtW9GE",
  authDomain: "spin2earn-6163a.firebaseapp.com",
  projectId: "spin2earn-6163a",
  storageBucket: "spin2earn-6163a.appspot.com",
  messagingSenderId: "803709564927",
  appId: "1:803709564927:web:5fd9771b9dc697100819ca",
  measurementId: "G-WG75N01RHM"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function showPage(id) {
  document.querySelectorAll('.container').forEach(div => div.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function handleProfileClick() {
  if (!auth.currentUser) {
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(result => {
        const user = result.user;
        document.getElementById('profileBtn').textContent = '👤 Profile';
        updateProfile(user);
        showPage('profile');
      });
  } else {
    showPage('profile');
  }
}

function updateProfile(user) {
  const userDetails = `
    <p><strong>Name:</strong> ${user.displayName}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <img src="${user.photoURL}" alt="User Image" style="width:80px;height:80px;border-radius:50%;">
  `;
  document.getElementById('userDetails').innerHTML = userDetails;
  db.collection('users').doc(user.uid).set({ coins: 100 }, { merge: true });
  loadWallet(user.uid);
}

function loadWallet(uid) {
  db.collection('users').doc(uid).get().then(doc => {
    const coins = doc.exists ? doc.data().coins : 0;
    document.getElementById('walletBalance').textContent = coins;
    document.getElementById('balanceCoins').textContent = coins;
    document.getElementById('coinCount').textContent = coins;
  });
}

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('profileBtn').textContent = '👤 Profile';
    updateProfile(user);
  }
});
// Firebase config and init
const firebaseConfig = {
  apiKey: "AIzaSyDHpvvfei0TkP6c7YlSe_RawuqwCrtW9GE",
  authDomain: "spin2earn-6163a.firebaseapp.com",
  projectId: "spin2earn-6163a",
  storageBucket: "spin2earn-6163a.firebasestorage.app",
  messagingSenderId: "803709564927",
  appId: "1:803709564927:web:5fd9771b9dc697100819ca",
  measurementId: "G-WG75N01RHM"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const grid = document.getElementById('grid');
const coinCount = document.getElementById('coinCount');
const restartBtn = document.getElementById('restartBtn');

const loginBtn = document.getElementById('loginBtn');
const userInfo = document.getElementById('userInfo');
const userNameDisplay = document.getElementById('userName');

let coins = 0;
let bombs = [];
let diamonds = [];
const gridSize = 6;
const totalBoxes = gridSize * gridSize;
const totalBombs = 12;
const totalDiamonds = totalBoxes - totalBombs;
let currentUser = null;

function initGame() {
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  coins = 0;
  coinCount.innerText = coins;
  bombs = [];
  diamonds = [];

  // Generate bomb positions
  while (bombs.length < totalBombs) {
    let rand = Math.floor(Math.random() * totalBoxes);
    if (!bombs.includes(rand)) bombs.push(rand);
  }

  // Remaining boxes are diamonds
  for (let i = 0; i < totalBoxes; i++) {
    if (!bombs.includes(i)) diamonds.push(i);
  }

  for (let i = 0; i < totalBoxes; i++) {
    const box = document.createElement('div');
    box.classList.add('box');
    box.dataset.index = i;
    box.addEventListener('click', handleClick);
    grid.appendChild(box);
  }
}

function handleClick(e) {
  const box = e.currentTarget;
  const index = parseInt(box.dataset.index);
  if (box.classList.contains('revealed')) return;

  box.classList.add('revealed');
  const content = document.createElement('span');

  if (bombs.includes(index)) {
    content.innerText = '💣';
    box.appendChild(content);
    alert('💥 Bomb! You lost all coins!');
    coins = 0;
    revealAll();
  } else if (diamonds.includes(index)) {
    content.innerText = '💎';
    box.appendChild(content);
    coins += 10;
  }

  coinCount.innerText = coins;

  // Update Firestore coins
  if (currentUser) {
    db.collection('users').doc(currentUser.uid).set({
      name: currentUser.displayName,
      coins: coins
    });
  }
}

function revealAll() {
  document.querySelectorAll('.box').forEach((box, i) => {
    if (!box.classList.contains('revealed')) {
      const span = document.createElement('span');
      if (bombs.includes(i)) span.innerText = '💣';
      else if (diamonds.includes(i)) span.innerText = '💎';
      box.appendChild(span);
      box.classList.add('revealed');
    }
  });
}

restartBtn.onclick = initGame;

// Google Login
loginBtn.onclick = async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    currentUser = result.user;
    loginBtn.style.display = 'none';
    userInfo.style.display = 'block';
    userNameDisplay.innerText = currentUser.displayName;

    // Load user's coins
    const doc = await db.collection('users').doc(currentUser.uid).get();
    if (doc.exists) {
      coins = doc.data().coins || 0;
      coinCount.innerText = coins;
    } else {
      db.collection('users').doc(currentUser.uid).set({
        name: currentUser.displayName,
        coins: 0
      });
    }
  } catch (err) {
    alert('Login failed');
    console.error(err);
  }
};

// Start the game on load
initGame();