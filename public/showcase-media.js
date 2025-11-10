const images = [
  "../assets/img/image.png",
  "../assets/img/obeer.png",
  "../assets/img/slay.png"
];

const imgA = document.getElementById("media1");
const imgB = document.getElementById("media2");

let currentIndex = 0;
let order = shuffle(images);
let showingA = true;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function newShuffle(prevLast) {
  let s;
  do { s = shuffle(images); } while (s[0] === prevLast && images.length > 1);
  return s;
}

// Inicjalizacja
imgA.src = order[0];
imgB.src = order[1 % order.length];

// Tick co 9s (połowa animacji 18s)
setInterval(() => {
  const visible = showingA ? imgA : imgB;
  const hidden  = showingA ? imgB : imgA;

  currentIndex++;
  if (currentIndex >= order.length) {
    order = newShuffle(order[order.length - 1]);
    currentIndex = 0;
  }

  hidden.src = order[currentIndex];
  showingA = !showingA;
}, 12000);
