// Custom logic goes here
console.log('EduGames clone initialized');

document.addEventListener('DOMContentLoaded', () => {
    const subjects = [
        { id: 'math', href: '/game/arqon/', title: 'ARQON TORTISH: MATEMATIKA' },
        { id: 'en', href: '/game/en/', title: 'ARQON TORTISH: INGLIZ TILI' },
        { id: 'ru', href: '/game/ru/', title: 'ARQON TORTISH: RUS TILI' },
        { id: 'mother', href: '/game/mother/', title: 'ARQON TORTISH: ONA TILI' },
        { id: 'biology', href: '/game/biology/', title: 'ARQON TORTISH: BIOLOGIYA' },
        { id: 'kimyo', href: '/game/kimyo/', title: 'ARQON TORTISH: KIMYO' },
        { id: 'fizika', href: '/game/fizika/', title: 'ARQON TORTISH: FIZIKA' },
        { id: 'history', href: '/game/history/', title: 'ARQON TORTISH: TARIX' },
        { id: 'geography', href: '/game/geography/', title: 'ARQON TORTISH: GEOGRAFIYA' },
        { id: 'informatika', href: '/game/informatika/', title: 'ARQON TORTISH: INFORMATIKA' },
        { id: 'literature', href: '/game/literature/', title: 'ARQON TORTISH: ADABIYOT' },
        { id: 'turkish', href: '/game/turkish/', title: 'ARQON TORTISH: TURK TILI' },
        { id: 'math', href: '/game/', title: 'ARQON TORTISH: MATEMATIKA' } // Default game links
    ];

    const modalOverlay = document.getElementById('game-modal-overlay');
    const gameUI = document.getElementById('game-ui');
    const gameHeaderTitle = document.querySelector('.game-header h2');
    
    let currentStep = 1;
    let gameMode = 'math';
    
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const btnPrev = document.getElementById('modal-prev-btn');
    const btnNext = document.getElementById('modal-next-btn');
    const btnStart = document.getElementById('modal-start-btn');
    
    let gameSettings = {
        operations: ['+'],
        difficulty: 'easy',
        team1Name: "1-Jamoa",
        team2Name: "2-Jamoa"
    };
    
    let gameState = {
        team1Score: 0,
        team2Score: 0,
        ropePos: 0, 
        timerInterval: null,
        secondsElapsed: 0,
        currentQ1: null,
        currentQ2: null,
        maxScore: 10
    };

    const questionBanks = {
        en: [
            { q: "Plural form of 'child' is:", options: ["Children", "Childes", "Childs", "Childrens"], correct: 0 },
            { q: "Opposite of 'big' is:", options: ["Long", "Small", "Short", "Tall"], correct: 1 },
            { q: "Past tense of 'go' is:", options: ["Goed", "Gone", "Went", "Going"], correct: 2 },
            { q: "Translate: 'Olma'", options: ["Banana", "Orange", "Apple", "Grape"], correct: 2 },
            { q: "Synonym for 'happy':", options: ["Sad", "Angry", "Joyful", "Tired"], correct: 2 }
        ],
        ru: [
            { q: "Сколько слогов в слове «молоко»?", options: ["4", "3", "1", "2"], correct: 1 },
            { q: "Сколько времен у глаголов в русском языке?", options: ["5", "4", "2", "3"], correct: 3 },
            { q: "Антоним к слову «большой»:", options: ["Высокий", "Длинный", "Маленький", "Широкий"], correct: 2 },
            { q: "Как пишется?", options: ["Пагода", "Погода", "Пагада", "Погада"], correct: 1 },
            { q: "Какой падеж отвечает на вопросы Кем? Чем?", options: ["Именительный", "Дательный", "Творительный", "Родительный"], correct: 2 }
        ],
        mother: [
            { q: "Qaysi gapda son bor?", options: ["U yugurdi", "Uch daftar", "Men keldim", "Yaxshi bola"], correct: 1 },
            { q: "Qaysi so'z harakatni bildiradi?", options: ["Ular", "Yozadi", "Daftar", "Katta"], correct: 1 },
            { q: "Sifat qanday so'roqqa javob bo'ladi?", options: ["Kim? Nima?", "Nima qildi?", "Qanday? Qanaqa?", "Nechta?"], correct: 2 },
            { q: "O'zbek alifbosida nechta harf bor?", options: ["28", "29", "30", "31"], correct: 1 },
            { q: "'Kitob' so'zi qaysi so'z turkumiga kiradi?", options: ["Sifat", "Ot", "Fe'l", "Son"], correct: 1 }
        ],
        biology: [
            { q: "Changlanish nima?", options: ["Changning urug'chaga tushishi", "Urug'ning unishi", "Meva hosil bo'lishi", "Fotosintez"], correct: 0 },
            { q: "Ovqat hazm qilish qayerda boshlanadi?", options: ["Qizilo'ngachda", "Ichakda", "Og'iz bo'shlig'ida", "Oshqozonda"], correct: 2 },
            { q: "Hujayraning asosiy qismi nima?", options: ["Qobiq", "Yadro", "Sitoplazma", "Vakuola"], correct: 1 },
            { q: "O'simlikka yashil rang beruvchi modda:", options: ["Xlorofill", "Kraxmal", "Shakar", "Oqsil"], correct: 0 },
            { q: "Inson yuragi nechta kamerali?", options: ["2", "3", "4", "5"], correct: 2 }
        ],
        kimyo: [
            { q: "Suvning kimyoviy formulasi qanday?", options: ["H2O", "CO2", "O2", "NaCl"], correct: 0 },
            { q: "Eng yengil gaz qaysi?", options: ["Kislorod", "Azot", "Vodorod", "Geliy"], correct: 2 },
            { q: "Osh tuzining formulasi:", options: ["H2SO4", "NaCl", "HCl", "NaOH"], correct: 1 },
            { q: "Havoning asosiy qismini qaysi gaz tashkil etadi?", options: ["Kislorod", "Vodorod", "Azot", "Karbonat angidrid"], correct: 2 },
            { q: "Temirning kimyoviy belgisi:", options: ["Te", "Fe", "Cu", "Ag"], correct: 1 }
        ],
        fizika: [
            { q: "Tezlik qanday harf bilan belgilanadi?", options: ["m", "t", "v", "s"], correct: 2 },
            { q: "Kuch qaysi asbob yordamida o'lchanadi?", options: ["Tarozu", "Dinamometr", "Spidometr", "Barometr"], correct: 1 },
            { q: "Massa birligi nima?", options: ["Nyuton", "Kilogramm", "Metr", "Sekund"], correct: 1 },
            { q: "Nyutonning nechta qonuni bor?", options: ["1", "2", "3", "4"], correct: 2 },
            { q: "Erkin tushish tezlanishi (g) nechaga teng?", options: ["9.8 m/s²", "10 m/s", "8.9 m/s²", "11 m/s²"], correct: 0 }
        ],
        history: [
            { q: "Amir Temur qachon tug'ilgan?", options: ["1336-yil", "1441-yil", "1370-yil", "1405-yil"], correct: 0 },
            { q: "Alisher Navoiy qayerda tug'ilgan?", options: ["Samarqand", "Xiva", "Hirot", "Buxoro"], correct: 2 },
            { q: "O'zbekiston qachon mustaqillikka erishdi?", options: ["1990", "1991", "1992", "1993"], correct: 1 },
            { q: "Birinchi jahon urushi qachon boshlangan?", options: ["1912", "1914", "1918", "1939"], correct: 1 },
            { q: "Zahiriddin Muhammad Bobur qayerda hukmronlik qilgan?", options: ["Xorazm", "Hindiston", "Eron", "Xitoy"], correct: 1 }
        ],
        geography: [
            { q: "Dunyodagi eng katta qit'a qaysi?", options: ["Afrika", "Shimoliy Amerika", "Yevrosiyo", "Avstraliya"], correct: 2 },
            { q: "Yer yuzining necha foizini suv egallagan?", options: ["50%", "60%", "71%", "80%"], correct: 2 },
            { q: "Eng uzun daryo qaysi?", options: ["Amazonka", "Nil", "Amudaryo", "Missisipi"], correct: 0 },
            { q: "O'zbekiston nechta davlat bilan chegaradosh?", options: ["4", "5", "6", "3"], correct: 1 },
            { q: "Dunyodagi eng katta okean qaysi?", options: ["Atlantika", "Hind", "Tinch", "Shimoliy Muz"], correct: 2 }
        ],
        informatika: [
            { q: "Eng kichik axborot o'lchov birligi:", options: ["Bayt", "Bit", "Kilobayt", "Megabayt"], correct: 1 },
            { q: "1 Bayt nechta bitdan iborat?", options: ["8", "10", "16", "32"], correct: 0 },
            { q: "Kompyuterning miyasi deb nima ataladi?", options: ["Monitor", "Klaviatura", "Protsessor", "Sichqoncha"], correct: 2 },
            { q: "Internet qachon paydo bo'lgan?", options: ["1950-yillar", "1960-yillar oxiri", "1990-yillar", "2000-yillar"], correct: 1 },
            { q: "Dasturlash tili qaysi biri?", options: ["HTML", "Windows", "Python", "Google"], correct: 2 }
        ],
        literature: [
            { q: "'Xamsa' asari muallifi kim?", options: ["Bobur", "Lutfiy", "Alisher Navoiy", "Mashrab"], correct: 2 },
            { q: "'O'tkan kunlar' romani qahramoni kim?", options: ["Otabek", "Anvar", "Sidiqjon", "Yo'lchi"], correct: 0 },
            { q: "'Shum bola' asari kimning qalamiga mansub?", options: ["Oybek", "G'afur G'ulom", "Abdulla Qodiriy", "Cho'lpon"], correct: 1 },
            { q: "Ruboiy nechta misradan iborat bo'ladi?", options: ["2", "4", "6", "8"], correct: 1 },
            { q: "Alpomish dostonidagi bosh qahramonning singlisi?", options: ["Barchin", "Qaldirg'och", "Oybarchin", "Surayyo"], correct: 1 }
        ],
        turkish: [
            { q: "Turk tilida 'Salom' nima deyiladi?", options: ["Merhaba", "Güle güle", "Teşekkür", "Lütfen"], correct: 0 },
            { q: "Turk alifbosida nechta harf bor?", options: ["28", "29", "30", "31"], correct: 1 },
            { q: "Turkiya poytaxti qayer?", options: ["Istanbul", "Ankara", "Izmir", "Antalya"], correct: 1 },
            { q: "'Su' so'zining tarjimasi nima?", options: ["Suv", "Non", "Olma", "Choy"], correct: 0 },
            { q: "Rahmat so'zining turkchasi:", options: ["Lütfen", "Evet", "Hayır", "Teşekkür ederim"], correct: 3 }
        ]
    };

    // Attach click events
    subjects.forEach(subject => {
        document.querySelectorAll(`a[href="${subject.href}"]`).forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                gameMode = subject.id;
                gameHeaderTitle.innerText = subject.title;
                openModal();
            });
        });
    });

    function openModal() {
        modalOverlay.classList.remove('hidden');
        modalOverlay.style.display = '';
        if (gameMode !== 'math') {
            document.querySelector('.game-modal-steps').classList.add('hide-el');
            currentStep = 3;
            updateModalUI();
        } else {
            document.querySelector('.game-modal-steps').classList.remove('hide-el');
            currentStep = 1;
            updateModalUI();
        }
    }

    document.querySelectorAll('.op-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
            const selected = Array.from(document.querySelectorAll('.op-btn.selected')).map(b => b.dataset.op);
            if (selected.length === 0) {
                document.querySelector('.op-btn[data-op="+"]').classList.add('selected');
                gameSettings.operations = ['+'];
            } else {
                gameSettings.operations = selected;
            }
        });
    });

    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected', 'bg-blue-light'));
            btn.classList.add('selected', 'bg-blue-light');
            gameSettings.difficulty = btn.dataset.diff;
        });
    });

    function updateModalUI() {
        steps.forEach(s => s.classList.remove('active'));
        stepContents.forEach(c => c.classList.remove('active'));
        
        if (gameMode === 'math') {
            document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');
        }
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
            if (gameMode === 'math') btnPrev.classList.remove('hidden');
            else btnPrev.classList.add('hidden'); 
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

    btnStart.addEventListener('click', () => {
        gameSettings.team1Name = document.getElementById('team1-name').value || "1-Jamoa";
        gameSettings.team2Name = document.getElementById('team2-name').value || "2-Jamoa";
        
        modalOverlay.classList.add('hidden');
        modalOverlay.style.display = 'none';
        document.body.style.overflow = 'hidden';
        gameUI.classList.remove('hidden');
        gameUI.style.display = '';
        
        if (gameMode !== 'math') {
            document.querySelectorAll('.numpad').forEach(el => el.classList.add('hide-el'));
            document.querySelectorAll('.answer-input').forEach(el => el.classList.add('hide-el'));
            document.getElementById('game-mcq1').classList.remove('hidden');
            document.getElementById('game-mcq2').classList.remove('hidden');
        } else {
            document.querySelectorAll('.numpad').forEach(el => el.classList.remove('hide-el'));
            document.querySelectorAll('.answer-input').forEach(el => el.classList.remove('hide-el'));
            document.getElementById('game-mcq1').classList.add('hidden');
            document.getElementById('game-mcq2').classList.add('hidden');
        }
        
        initGame();
    });
    
    document.getElementById('game-exit-btn').addEventListener('click', exitGame);
    document.getElementById('exit-game-btn2').addEventListener('click', exitGame);
    document.getElementById('play-again-btn').addEventListener('click', initGame);

    function exitGame() {
        gameUI.classList.add('hidden');
        gameUI.style.display = 'none';
        document.getElementById('game-over-overlay').classList.add('hidden');
        document.getElementById('game-over-overlay').style.display = 'none';
        document.body.style.overflow = '';
        clearInterval(gameState.timerInterval);
    }

    function generateQuestion() {
        if (gameMode === 'math') {
            const ops = gameSettings.operations;
            const op = ops[Math.floor(Math.random() * ops.length)];
            let maxNum = 10;
            if (gameSettings.difficulty === 'medium') maxNum = 50;
            if (gameSettings.difficulty === 'hard') maxNum = 100;
            
            let a = Math.floor(Math.random() * maxNum) + 1;
            let b = Math.floor(Math.random() * maxNum) + 1;
            
            if (op === '-') {
                if (a < b) [a, b] = [b, a]; 
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
            return { str: qStr, ans: ans, type: 'math' };
        } else {
            const bank = questionBanks[gameMode] || questionBanks['en'];
            const idx = Math.floor(Math.random() * bank.length);
            const qObj = bank[idx];
            return { str: qObj.q, options: qObj.options, correct: qObj.correct, type: gameMode };
        }
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
        
        document.querySelectorAll('.mcq-btn').forEach(btn => {
            btn.classList.remove('correct', 'wrong');
        });
        
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
            if (gameMode === 'math') {
                document.getElementById('game-answer1').value = "";
            } else {
                ['A', 'B', 'C', 'D'].forEach((ltr, i) => {
                    document.getElementById(`mcq1-${ltr}`).innerText = q.options[i];
                });
                document.querySelectorAll(`.mcq-btn[data-team="1"]`).forEach(b => b.classList.remove('correct', 'wrong'));
            }
        } else {
            gameState.currentQ2 = q;
            document.getElementById('game-question2').innerText = q.str;
            if (gameMode === 'math') {
                document.getElementById('game-answer2').value = "";
            } else {
                ['A', 'B', 'C', 'D'].forEach((ltr, i) => {
                    document.getElementById(`mcq2-${ltr}`).innerText = q.options[i];
                });
                document.querySelectorAll(`.mcq-btn[data-team="2"]`).forEach(b => b.classList.remove('correct', 'wrong'));
            }
        }
    }

    function updateScores() {
        document.getElementById('game-team1-score').innerText = gameState.team1Score;
        document.getElementById('game-team1-score-center').innerText = gameState.team1Score;
        document.getElementById('game-team2-score').innerText = gameState.team2Score;
        document.getElementById('game-team2-score-center').innerText = gameState.team2Score;
    }

    function updateRope() {
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
        document.getElementById('game-over-overlay').style.display = '';
    }
    
    function handleCorrect(team) {
        if (team === 1) {
            gameState.team1Score++;
            gameState.ropePos -= 1;
        } else {
            gameState.team2Score++;
            gameState.ropePos += 1;
        }
        updateScores();
        updateRope();
        nextQuestion(team);
    }

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
                    inputEl.style.backgroundColor = '#dcfce7'; 
                    setTimeout(() => inputEl.style.backgroundColor = '', 300);
                    handleCorrect(team);
                } else {
                    inputEl.style.backgroundColor = '#fee2e2'; 
                    setTimeout(() => {
                        inputEl.style.backgroundColor = '';
                        inputEl.value = "";
                    }, 400);
                }
            } else {
                if (inputEl.value.length < 5) inputEl.value += val;
            }
        });
    });

    document.querySelectorAll('.mcq-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const team = parseInt(btn.dataset.team);
            const idx = parseInt(btn.dataset.idx);
            const q = team === 1 ? gameState.currentQ1 : gameState.currentQ2;
            
            if (idx === q.correct) {
                btn.classList.add('correct');
                setTimeout(() => handleCorrect(team), 300);
            } else {
                btn.classList.add('wrong');
                setTimeout(() => btn.classList.remove('wrong'), 400);
            }
        });
    });

});
