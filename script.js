// Game variables
let currentOperation = null;
let currentStage = 1;
let score = 0;
let timeLeft = 60;
let timerInterval = null;
let currentProblem = null;
let userInput = '';
let problemsSolved = 0;
let totalScore = 0;
let stageScores = [];

// DOM elements
const gameContainer = document.getElementById('game-container');
const stageDisplay = document.getElementById('stage');
const problemDisplay = document.getElementById('problem');
const inputDisplay = document.getElementById('input-display');
const messageDisplay = document.getElementById('message');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const numpadButtons = document.querySelectorAll('.numpad button');
const operationButtons = {
    add: document.getElementById('add'),
    subtract: document.getElementById('subtract'),
    multiply: document.getElementById('multiply'),
    divide: document.getElementById('divide')
};

// Operation functions
const operations = {
    add: {
        symbol: '+',
        func: (a, b) => a + b
    },
    subtract: {
        symbol: '-',
        func: (a, b) => a - b
    },
    multiply: {
        symbol: '×',
        func: (a, b) => a * b
    },
    divide: {
        symbol: '÷',
        func: (a, b) => Math.round(a / b * 100) / 100
    }
};

// Initialize game
function initGame() {
    gameContainer.style.display = 'none';
    
    for (const [op, button] of Object.entries(operationButtons)) {
        button.addEventListener('click', () => startGame(op));
    }
    
    numpadButtons.forEach(button => {
        if (button.textContent.match(/[0-9]/)) {
            button.addEventListener('click', () => appendNumber(button.textContent));
        } else if (button.classList.contains('negative')) {
            button.addEventListener('click', toggleNegative);
        } else if (button.classList.contains('clear')) {
            button.addEventListener('click', clearInput);
        } else if (button.classList.contains('enter')) {
            button.addEventListener('click', checkAnswer);
        }
    });
}

function startGame(operation) {
    currentOperation = operation;
    currentStage = 1;
    score = 0;
    timeLeft = 60;
    problemsSolved = 0;
    totalScore = 0;
    stageScores = [];
    
    stageDisplay.textContent = currentStage;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    
    gameContainer.style.display = 'block';
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    
    generateProblem();
}

function generateProblem() {
    let a, b;
    
    switch (currentStage) {
        case 1:
            a = getRandomInt(1, 9);
            b = getRandomInt(1, 9);
            break;
        case 2:
            a = getRandomInt(1, 9);
            b = getRandomInt(10, 99);
            break;
        case 3:
            a = getRandomInt(10, 99);
            b = getRandomInt(10, 99);
            break;
        case 4:
            a = getRandomInt(10, 99);
            b = getRandomInt(100, 999);
            break;
        case 5:
            a = getRandomInt(100, 999);
            b = getRandomInt(100, 999);
            break;
    }
    
    if (currentOperation === 'divide') {
        if (currentStage === 1) {
            const divisors = [];
            for (let i = 1; i <= a; i++) {
                if (a % i === 0) divisors.push(i);
            }
            b = divisors[getRandomInt(0, divisors.length - 1)];
        } else {
            const multiplier = getRandomInt(2, 9);
            a = b * multiplier;
        }
    } else if (currentOperation === 'subtract') {
        if (a < b) [a, b] = [b, a];
    }
    
    currentProblem = { a, b };
    problemDisplay.textContent = `${a} ${operations[currentOperation].symbol} ${b} = ?`;
    clearInput();
}

function updateTimer() {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    
    if (timeLeft <= 0) {
        endStage();
    }
}

function appendNumber(num) {
    userInput += num;
    updateInputDisplay();
}

function toggleNegative() {
    if (userInput.startsWith('-')) {
        userInput = userInput.substring(1);
    } else {
        userInput = '-' + userInput;
    }
    updateInputDisplay();
}

function clearInput() {
    userInput = '';
    updateInputDisplay();
    messageDisplay.textContent = '';
    messageDisplay.className = 'message';
}

function updateInputDisplay() {
    inputDisplay.textContent = userInput || '0';
}

function checkAnswer() {
    if (!userInput) return;
    
    const userAnswer = parseFloat(userInput);
    let correctAnswer = operations[currentOperation].func(currentProblem.a, currentProblem.b);
    
    if (currentOperation === 'divide') {
        correctAnswer = Math.round(correctAnswer * 100) / 100;
    }
    
    if (userAnswer === correctAnswer) {
        score += 5;
        scoreDisplay.textContent = score;
        messageDisplay.textContent = 'Правильно! +5 балів';
        messageDisplay.className = 'message correct';
        problemsSolved++;
    } else {
        messageDisplay.textContent = `Неправильно! Правильна відповідь: ${correctAnswer}`;
        messageDisplay.className = 'message incorrect';
        timeLeft = Math.max(0, timeLeft - 4);
        timerDisplay.textContent = timeLeft;
    }
    
    setTimeout(() => {
        if (timeLeft > 0) {
            generateProblem();
        }
    }, 1500);
}

function endStage() {
    clearInterval(timerInterval);
    
    stageScores.push({
        stage: currentStage,
        score: score
    });
    totalScore += score;
    
    if (score >= 45) {
        currentStage++;
        
        if (currentStage <= 5) {
            stageDisplay.textContent = currentStage;
            score = 0;
            scoreDisplay.textContent = score;
            timeLeft = 60;
            timerDisplay.textContent = timeLeft;
            problemsSolved = 0;
            
            timerInterval = setInterval(updateTimer, 1000);
            generateProblem();
        } else {
            showFinalResults();
        }
    } else {
        showFinalResults();
    }
}

function showFinalResults() {
    let resultsHTML = `
        <h2>Результати змагання</h2>
        <table class="results-table">
            <tr>
                <th>Етап</th>
                <th>Бали</th>
                <th>Статус</th>
            </tr>
    `;
    
    for (let i = 0; i < stageScores.length; i++) {
        const stageResult = stageScores[i];
        const status = stageResult.score >= 45 ? 
            '<span class="passed">Пройдено</span>' : 
            '<span class="failed">Не пройдено</span>';
        
        resultsHTML += `
            <tr>
                <td>${stageResult.stage}</td>
                <td>${stageResult.score}</td>
                <td>${status}</td>
            </tr>
        `;
    }
    
    resultsHTML += `
        <tr class="total-row">
            <td><strong>Всього</strong></td>
            <td><strong>${totalScore}</strong></td>
            <td></td>
        </tr>
        </table>
        <button class="restart-button">Почати нову гру</button>
    `;
    
    problemDisplay.innerHTML = resultsHTML;
    inputDisplay.textContent = '';
    messageDisplay.textContent = '';
    
    document.querySelector('.restart-button').addEventListener('click', () => {
        stageScores = [];
        totalScore = 0;
        problemDisplay.textContent = '';
        startGame(currentOperation);
    });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.addEventListener('DOMContentLoaded', initGame);
