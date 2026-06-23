// Custom logic goes here
console.log('EduGames clone initialized');
// Arqon Tortish Game Logic

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const mathCards = document.querySelectorAll('a[href="/game/arqon/"]');
    const modalOverlay = document.getElementById('game-modal-overlay');
    const gameUI = document.getElementById('game-ui');
    const appMain = document.querySelector('body > :not(#game-modal-overlay):not(#game-ui):not(script)');
    
    // Modal steps
    let currentStep = 1;
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const btnPrev = document.getElementById('modal-prev-btn');
    const btnNext = document.getElementById('modal-next-btn');
    const btnStart = document.getElementById('modal-start-btn');
    
    // Game state
    let gameSettings = {
        operations: ['+'],
        difficulty: 'easy',
        team1Name: "1-Jamoa",
        team2Name: "2-Jamoa"
    };
    
    let gameState = {
        team1Score: 0,
        team2Score: 0,
        ropePos: 0, // -10 to +10 (negative means blue wins, positive means red wins)
        timerInterval: null,
        secondsElapsed: 0,
        currentQ1: null,
        currentQ2: null,
        maxScore: 10
    };

    // 1. Open Modal
    mathCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            modalOverlay.classList.remove('hidden');
        });
    });

    // 2. Modal interactions
    // Operations
    document.querySelectorAll('.op-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
            updateOperations();
        });
    });
    
    function updateOperations() {
        const selected = Array.from(document.querySelectorAll('.op-btn.selected')).map(b => b.dataset.op);
        if (selected.length === 0) {
            // force at least one
            document.querySelector('.op-btn[data-op="+"]').classList.add('selected');
            gameSettings.operations = ['+'];
        } else {
            gameSettings.operations = selected;
        }
    }

    // Difficulty
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected', 'bg-blue-light'));
            btn.classList.add('selected', 'bg-blue-light');
            gameSettings.difficulty = btn.dataset.diff;
        });
    });

    // Navigation
    function updateModalUI() {
        steps.forEach(s => s.classList.remove('active'));
        stepContents.forEach(c => c.classList.remove('active'));
        
        document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');
        document.getElementById(`step-${currentStep}-content`).classList.add('active');
        
        if (currentStep === 1) {
            btnPrev.classList.add('hidden');
            btnNext.classList.remove('hidden');
            btnStart.classList.add('hidden');
        } else if (currentStep === 2) {
            btnPrev.classList.remove('hidden');
            btnNext.classList.remove('hidden');
            btnStart.classList.add('hidden');
        } else if (currentStep === 3) {
            btnPrev.classList.remove('hidden');
            btnNext.classList.add('hidden');
            btnStart.classList.remove('hidden');
        }
    }

    btnNext.addEventListener('click', () => {
        if (currentStep < 3) {
            currentStep++;
            updateModalUI();
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateModalUI();
        }
    });

    // 3. Start Game
    btnStart.addEventListener('click', () => {
        gameSettings.team1Name = document.getElementById('team1-name').value || "1-Jamoa";
        gameSettings.team2Name = document.getElementById('team2-name').value || "2-Jamoa";
        
        modalOverlay.classList.add('hidden');
        document.body.style.overflow = 'hidden';
        gameUI.classList.remove('hidden');
        
        initGame();
    });
    
    document.getElementById('game-exit-btn').addEventListener('click', exitGame);
    document.getElementById('exit-game-btn2').addEventListener('click', exitGame);
    document.getElementById('play-again-btn').addEventListener('click', initGame);

    function exitGame() {
        gameUI.classList.add('hidden');
        document.getElementById('game-over-overlay').classList.add('hidden');
        document.body.style.overflow = '';
        clearInterval(gameState.timerInterval);
    }

    // --- GAME LOGIC ---

    function generateQuestion() {
        const ops = gameSettings.operations;
        const op = ops[Math.floor(Math.random() * ops.length)];
        let maxNum = 10;
        
        if (gameSettings.difficulty === 'medium') maxNum = 50;
        if (gameSettings.difficulty === 'hard') maxNum = 100;
        
        let a = Math.floor(Math.random() * maxNum) + 1;
        let b = Math.floor(Math.random() * maxNum) + 1;
        
        if (op === '-') {
            if (a < b) [a, b] = [b, a]; // Ensure positive result
        } else if (op === '*') {
            if (gameSettings.difficulty === 'easy') { a = a%10+1; b = b%10+1; }
            else if (gameSettings.difficulty === 'medium') { a = a%20+1; b = b%10+1; }
            else { a = a%20+1; b = b%20+1; }
        } else if (op === '/') {
            let res = Math.floor(Math.random() * (maxNum/2)) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            a = res * b;
        }
        
        const qStr = `${a} ${op === '*' ? '×' : op === '/' ? '÷' : op} ${b} = ?`;
        let ans;
        if (op === '+') ans = a + b;
        if (op === '-') ans = a - b;
        if (op === '*') ans = a * b;
        if (op === '/') ans = a / b;
        
        return { str: qStr, ans: ans };
    }

    function initGame() {
        document.getElementById('game-over-overlay').classList.add('hidden');
        gameState = {
            team1Score: 0,
            team2Score: 0,
            ropePos: 0,
            timerInterval: null,
            secondsElapsed: 0,
            maxScore: 10
        };
        
        document.getElementById('game-team1-name').innerText = gameSettings.team1Name;
        document.getElementById('game-team2-name').innerText = gameSettings.team2Name;
        document.getElementById('game-answer1').value = "";
        document.getElementById('game-answer2').value = "";
        
        updateScores();
        updateRope();
        nextQuestion(1);
        nextQuestion(2);
        
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = setInterval(() => {
            gameState.secondsElapsed++;
            const m = String(Math.floor(gameState.secondsElapsed / 60)).padStart(2, '0');
            const s = String(gameState.secondsElapsed % 60).padStart(2, '0');
            document.getElementById('game-timer').innerText = `${m}:${s}`;
        }, 1000);
    }
    
    function nextQuestion(teamNum) {
        const q = generateQuestion();
        if (teamNum === 1) {
            gameState.currentQ1 = q;
            document.getElementById('game-question1').innerText = q.str;
            document.getElementById('game-answer1').value = "";
        } else {
            gameState.currentQ2 = q;
            document.getElementById('game-question2').innerText = q.str;
            document.getElementById('game-answer2').value = "";
        }
    }

    function updateScores() {
        document.getElementById('game-team1-score').innerText = gameState.team1Score;
        document.getElementById('game-team1-score-center').innerText = gameState.team1Score;
        document.getElementById('game-team2-score').innerText = gameState.team2Score;
        document.getElementById('game-team2-score-center').innerText = gameState.team2Score;
    }

    function updateRope() {
        // SVG rope moves left or right. max offset is 150px
        const maxOffset = 150;
        const posPixels = (gameState.ropePos / gameState.maxScore) * maxOffset;
        const container = document.getElementById('rope-container');
        container.style.transform = `translateX(${posPixels}px)`;
        
        if (Math.abs(gameState.ropePos) >= gameState.maxScore) {
            endGame(gameState.ropePos < 0 ? 1 : 2);
        }
    }

    function endGame(winnerNum) {
        clearInterval(gameState.timerInterval);
        const wName = winnerNum === 1 ? gameSettings.team1Name : gameSettings.team2Name;
        document.getElementById('winner-text').innerText = `${wName.toUpperCase()} G'OLIB!`;
        document.getElementById('winner-text').style.color = winnerNum === 1 ? '#0284c7' : '#dc2626';
        document.getElementById('game-over-overlay').classList.remove('hidden');
    }

    // Numpad logic
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const team = parseInt(btn.dataset.team);
            const val = btn.dataset.val;
            const inputEl = document.getElementById(`game-answer${team}`);
            
            if (val === 'clear') {
                inputEl.value = inputEl.value.slice(0, -1);
            } else if (val === 'submit') {
                const q = team === 1 ? gameState.currentQ1 : gameState.currentQ2;
                if (parseInt(inputEl.value) === q.ans) {
                    // Correct!
                    if (team === 1) {
                        gameState.team1Score++;
                        gameState.ropePos -= 1;
                    } else {
                        gameState.team2Score++;
                        gameState.ropePos += 1;
                    }
                    inputEl.style.backgroundColor = '#dcfce7'; // green flash
                    setTimeout(() => inputEl.style.backgroundColor = '', 300);
                    updateScores();
                    updateRope();
                    nextQuestion(team);
                } else {
                    // Wrong!
                    inputEl.style.backgroundColor = '#fee2e2'; // red flash
                    setTimeout(() => {
                        inputEl.style.backgroundColor = '';
                        inputEl.value = "";
                    }, 400);
                }
            } else {
                if (inputEl.value.length < 5) {
                    inputEl.value += val;
                }
            }
        });
    });

    // Keyboard support for testing easily
    document.addEventListener('keydown', (e) => {
        if (!gameUI.classList.contains('hidden') && document.getElementById('game-over-overlay').classList.contains('hidden')) {
            // Check keys for Team 1 (A-Z or just 1-9 on normal row)
            // It's tricky to map two distinct numpads to one keyboard.
            // Let's just bind Numpad to Team 1 for demo purposes if needed, or ignore it.
        }
    });

});
