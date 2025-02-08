const dashboard = document.getElementById('dashboard');
const mainContent = document.getElementById('mainContent');
const celebration = document.getElementById('celebration');
const gameContainer = document.getElementById('gameContainer');
const start5x5Button = document.getElementById('start5x5');
const start3x3Button = document.getElementById('start3x3');
const resetButton = document.getElementById('resetButton');
const pauseButton = document.getElementById('pauseButton');
const restartGameButton = document.getElementById('restartGame');
const timerDisplay = document.getElementById('timer');
const randomNumberDisplay = document.getElementById('randomNumberDisplay');
const completionTime = document.getElementById('completionTime');
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const themeButton = document.getElementById('themeButton');

let numbers = [];
let currentTarget = null;
let isGameActive = false;
let gridSize = 5; // Default grid size
let startTime = null;
let elapsedTimePaused = 0;
let intervalId = null;
let isPaused = false;
let isDarkMode = false;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function createTable(size) {
  gameContainer.innerHTML = '';
  gameContainer.style.gridTemplateColumns = `repeat(${size}, 70px)`;
  numbers = [];
  const maxNumber = size * size; // Limit to 9 for 3x3 or 25 for 5x5
  for (let i = 1; i <= maxNumber; i++) {
    numbers.push(i);
  }
  shuffleArray(numbers);

  numbers.forEach((number) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    if (!document.querySelector(`.cell[data-number="${number}"].clicked`)) {
      cell.textContent = number;
      cell.dataset.number = number;
    }
    gameContainer.appendChild(cell);
  });
}

function startGame(size) {
  gridSize = size;
  isGameActive = true;
  currentTarget = gridSize === 3 ? 9 : 25; // Start from 9 for 3x3, 25 for 5x5
  randomNumberDisplay.textContent = currentTarget;
  createTable(gridSize);

  startTime = Date.now() - elapsedTimePaused;
  intervalId = setInterval(updateTimer, 1000);

  resetButton.disabled = false;
  pauseButton.disabled = false;

  // Hide dashboard and show main content
  dashboard.style.transform = 'translateX(-100%)';
  mainContent.classList.add('active');
}

function updateTimer() {
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `Time: ${elapsedTime}s`;
}

function resetGame() {
  isGameActive = false;
  clearInterval(intervalId);
  currentTarget = null;
  timerDisplay.textContent = 'Time: 0s';
  randomNumberDisplay.textContent = '-';
  gameContainer.innerHTML = '';

  resetButton.disabled = true;
  pauseButton.disabled = true;

  // Reset pause state
  elapsedTimePaused = 0;
  isPaused = false;

  // Hide celebration and reset main content
  celebration.classList.remove('active');
  mainContent.classList.remove('active');
  dashboard.style.transform = 'translateX(0)';
}

function pauseGame() {
  if (!isGameActive || isPaused) return;

  isPaused = true;
  clearInterval(intervalId);
  elapsedTimePaused = Date.now() - startTime; // Save elapsed time
  pauseButton.textContent = "Resume"; // Change button text to "Resume"
}

function resumeGame() {
  if (!isGameActive || !isPaused) return;

  isPaused = false;
  startTime = Date.now() - elapsedTimePaused; // Resume from paused time
  intervalId = setInterval(updateTimer, 1000);
  pauseButton.textContent = "Pause"; // Change button text back to "Pause"
}

function togglePause() {
  if (isPaused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-theme', isDarkMode);
  themeButton.textContent = isDarkMode ? "Disable Dark Mode" : "Enable Dark Mode";
}

function vibrateDevice() {
  if (navigator.vibrate) {
    navigator.vibrate(200); // Vibrate for 200ms
  }
}

gameContainer.addEventListener('click', (e) => {
  if (!isGameActive || !e.target.classList.contains('cell')) return;

  const clickedNumber = parseInt(e.target.dataset.number, 10);
  if (clickedNumber === currentTarget) {
    e.target.classList.add('clicked');
    correctSound.play();

    // Decrement the target number
    currentTarget--;

    // Check if all numbers are clicked
    if (currentTarget === 0) {
      clearInterval(intervalId);
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      completionTime.textContent = elapsedTime;
      celebration.classList.add('active'); // Show celebration message
      return;
    }

    // Update the random number display
    randomNumberDisplay.textContent = currentTarget;

    // Shuffle the table after each correct click
    setTimeout(() => {
      createTable(gridSize);
    }, 200); // Small delay to visually confirm the clicked cell
  } else {
    e.target.classList.add('wrong');
    wrongSound.play();
    vibrateDevice();

    setTimeout(() => {
      e.target.classList.remove('wrong');
    }, 500); // Remove the "wrong" class after the shake animation
  }
});

start5x5Button.addEventListener('click', () => startGame(5));
start3x3Button.addEventListener('click', () => startGame(3));
resetButton.addEventListener('click', resetGame);
pauseButton.addEventListener('click', togglePause);
restartGameButton.addEventListener('click', () => {
  celebration.classList.remove('active');
  resetGame();
});
themeButton.addEventListener('click', toggleTheme);