const grid = document.getElementById('grid');
const movesElement = document.getElementById('moves');
const matchesElement = document.getElementById('matches');
const restartBtn = document.getElementById('restartBtn');

const emojis = ['🚀', '🛸', '👾', '☄️', '🌟', '🌙', '⚡', '🔥'];
let cardsArray = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;

function initGame() {
    grid.innerHTML = '';
    moves = 0;
    matches = 0;
    movesElement.textContent = moves;
    matchesElement.textContent = matches;
    firstCard = null;
    secondCard = null;
    lockBoard = false;

    // Create pairs
    cardsArray = [...emojis, ...emojis];
    
    // Shuffle
    cardsArray.sort(() => 0.5 - Math.random());

    cardsArray.forEach(emoji => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.name = emoji;

        const front = document.createElement('div');
        front.classList.add('card-face', 'card-front');
        front.textContent = emoji;

        const back = document.createElement('div');
        back.classList.add('card-face', 'card-back');

        card.appendChild(front);
        card.appendChild(back);
        
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return; // double click same card

    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    movesElement.textContent = moves;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;

    if (isMatch) {
        disableCards();
        matches++;
        matchesElement.textContent = matches;
        
        if (matches === emojis.length) {
            setTimeout(() => {
                alert(`YOU WIN! Total moves: ${moves}`);
            }, 500);
        }
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    // add glowing effect to matched
    firstCard.querySelector('.card-front').style.borderColor = '#00ff00';
    secondCard.querySelector('.card-front').style.borderColor = '#00ff00';

    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

restartBtn.addEventListener('click', initGame);

initGame();
