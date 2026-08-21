// ===== DrDer-Switch - التحكم في الواجهة والتفاعلات =====

class GameApp {
    constructor() {
        this.gameLogic = gameLogic;
        this.boardElement = document.getElementById('game-board');
        this.homeScreen = document.getElementById('home-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.winOverlay = document.getElementById('win-overlay');
        this.levelNumberElement = document.getElementById('level-number');
        this.movesCountElement = document.getElementById('moves-count');
        this.startBtn = document.getElementById('start-btn');
        this.continueBtn = document.getElementById('continue-btn');
        this.continueLevelElement = document.getElementById('continue-level');
        this.resetBtn = document.getElementById('reset-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.overlayNextBtn = document.getElementById('overlay-next-btn');
        this.overlayHomeBtn = document.getElementById('overlay-home-btn');
        this.tutorialHint = null;
        this.highlightedCell = null;
        this.solutionMoves = [];
        this.currentSolutionIndex = 0;
        
        this.currentLevel = 1;
        this.savedLevel = 1;
        
        this.initializeApp();
        this.setupEventListeners();
    }

    initializeApp() {
        this.savedLevel = this.gameLogic.getSavedProgress();
        
        if (this.savedLevel > 1) {
            this.continueBtn.classList.remove('hidden');
            this.continueLevelElement.textContent = this.savedLevel;
        }
        
        this.showScreen(this.homeScreen);
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => {
            this.startNewGame();
        });

        this.continueBtn.addEventListener('click', () => {
            this.startFromLevel(this.savedLevel);
        });

        this.resetBtn.addEventListener('click', () => {
            this.resetCurrentLevel();
        });

        this.nextBtn.addEventListener('click', () => {
            this.startNextLevel();
        });

        this.overlayNextBtn.addEventListener('click', () => {
            this.startNextLevel();
        });

        this.overlayHomeBtn.addEventListener('click', () => {
            this.goToHome();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.resetCurrentLevel();
            }
        });
    }

    showScreen(screen) {
        this.homeScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.winOverlay.classList.add('hidden');
        
        if (screen === this.homeScreen) {
            this.homeScreen.classList.add('active');
        } else if (screen === this.gameScreen) {
            this.gameScreen.classList.add('active');
        }
    }

    startNewGame() {
        this.startFromLevel(1);
    }

    startFromLevel(levelNumber) {
        this.currentLevel = levelNumber;
        this.showScreen(this.gameScreen);
        this.loadLevel(levelNumber);
    }

    loadLevel(levelNumber) {
        this.removeTutorialHint();
        
        this.gameLogic.generateLevel(levelNumber);
        
        this.updateUI();
        this.createBoard();
        
        if (levelNumber >= 1 && levelNumber <= 3) {
            this.showTutorialHint(levelNumber);
            this.loadSolution();
        }
        
        this.nextBtn.classList.add('hidden');
        this.gameLogic.saveProgress(levelNumber);
    }

    removeTutorialHint() {
        if (this.tutorialHint) {
            this.tutorialHint.remove();
            this.tutorialHint = null;
        }
        if (this.highlightedCell) {
            this.highlightedCell.classList.remove('solution-highlight');
            this.highlightedCell = null;
        }
        this.solutionMoves = [];
        this.currentSolutionIndex = 0;
    }

    showTutorialHint(levelNumber) {
        this.tutorialHint = document.createElement('div');
        this.tutorialHint.className = 'tutorial-hint';
        
        let hintText = '';
        if (levelNumber === 1) {
            hintText = `
                <strong>🎯 المرحلة 1 - تعلم الأساسيات</strong>
                اضغط على المربع <span class="highlight-text">الأخضر الوامض</span> لتغيير لونه والمربعات المجاورة
                <br>
                الهدف: اجعل جميع المربعات زرقاء!
            `;
        } else if (levelNumber === 2) {
            hintText = `
                <strong>🎯 المرحلة 2 - خطوتين للحل</strong>
                اتبع الترتيب: اضغط أولاً على المربع <span class="highlight-text">الأخضر الوامض</span>
                <br>
                ثم اضغط على المربع الذي سيظهر بعده!
            `;
        } else if (levelNumber === 3) {
            hintText = `
                <strong>🎯 المرحلة 3 - ثلاث خطوات</strong>
                اتبع الترتيب: اضغط على المربعات <span class="highlight-text">الخضراء الوامضة</span> بالترتيب
                <br>
                كل خطوة ستظهر لك المربع التالي!
            `;
        }
        
        this.tutorialHint.innerHTML = hintText;
        this.boardElement.parentNode.insertBefore(this.tutorialHint, this.boardElement);
    }

    loadSolution() {
        this.solutionMoves = this.gameLogic.getSolution();
        this.currentSolutionIndex = 0;
        
        if (this.solutionMoves.length > 0) {
            this.highlightNextSolutionCell();
        }
    }

    highlightNextSolutionCell() {
        if (this.highlightedCell) {
            this.highlightedCell.classList.remove('solution-highlight');
            this.highlightedCell = null;
        }
        
        if (this.currentSolutionIndex < this.solutionMoves.length) {
            const [row, col] = this.solutionMoves[this.currentSolutionIndex];
            const cellIndex = row * this.gameLogic.size + col;
            const cells = this.boardElement.querySelectorAll('.cell');
            
            if (cells[cellIndex]) {
                this.highlightedCell = cells[cellIndex];
                this.highlightedCell.classList.add('solution-highlight');
            }
        }
    }

    createBoard() {
        this.boardElement.innerHTML = '';
        
        const boardSize = this.gameLogic.size;
        this.boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
        this.boardElement.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;
        
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', () => {
                    this.handleCellClick(i, j);
                });
                
                cell.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.handleCellClick(i, j);
                });
                
                this.boardElement.appendChild(cell);
            }
        }
        
        this.updateBoardDisplay();
    }

    handleCellClick(row, col) {
        if (this.gameLogic.isComplete) {
            return;
        }
        
        if (this.currentLevel <= 3 && this.solutionMoves.length > 0) {
            if (this.currentSolutionIndex < this.solutionMoves.length) {
                const [correctRow, correctCol] = this.solutionMoves[this.currentSolutionIndex];
                
                if (row === correctRow && col === correctCol) {
                    this.currentSolutionIndex++;
                    
                    if (this.highlightedCell) {
                        this.highlightedCell.classList.remove('solution-highlight');
                        this.highlightedCell = null;
                    }
                }
            }
            
            if (this.tutorialHint) {
                this.tutorialHint.style.opacity = '0';
                setTimeout(() => {
                    if (this.tutorialHint) {
                        this.tutorialHint.remove();
                        this.tutorialHint = null;
                    }
                }, 300);
            }
        }
        
        const affectedCells = this.gameLogic.getAffectedCells(row, col);
        
        this.gameLogic.toggleCell(row, col);
        this.gameLogic.moves++;
        
        this.updateBoardDisplay();
        this.updateUI();
        this.applyCellAnimations(affectedCells);
        
        if (this.currentLevel <= 3 && this.solutionMoves.length > 0) {
            setTimeout(() => {
                this.highlightNextSolutionCell();
            }, 500);
        }
        
        if (this.gameLogic.checkComplete()) {
            this.handleLevelComplete();
        }
    }

    applyCellAnimations(affectedCells) {
        const cells = this.boardElement.querySelectorAll('.cell');
        
        affectedCells.forEach(([row, col]) => {
            const index = row * this.gameLogic.size + col;
            if (cells[index]) {
                cells[index].classList.add('affected');
                setTimeout(() => {
                    cells[index].classList.remove('affected');
                }, 300);
            }
        });
    }

    updateBoardDisplay() {
        const cells = this.boardElement.querySelectorAll('.cell');
        
        for (let i = 0; i < this.gameLogic.size; i++) {
            for (let j = 0; j < this.gameLogic.size; j++) {
                const index = i * this.gameLogic.size + j;
                if (cells[index]) {
                    if (this.gameLogic.board[i][j]) {
                        cells[index].classList.add('on');
                    } else {
                        cells[index].classList.remove('on');
                    }
                }
            }
        }
    }

    updateUI() {
        this.levelNumberElement.textContent = this.currentLevel;
        this.movesCountElement.textContent = this.gameLogic.moves;
    }

    handleLevelComplete() {
        this.winOverlay.classList.remove('hidden');
        this.nextBtn.classList.remove('hidden');
        this.gameLogic.saveProgress(this.currentLevel + 1);
        
        this.savedLevel = this.currentLevel + 1;
        this.continueBtn.classList.remove('hidden');
        this.continueLevelElement.textContent = this.savedLevel;
        
        this.removeTutorialHint();
    }

    startNextLevel() {
        this.currentLevel++;
        this.winOverlay.classList.add('hidden');
        this.loadLevel(this.currentLevel);
    }

    resetCurrentLevel() {
        this.winOverlay.classList.add('hidden');
        this.loadLevel(this.currentLevel);
    }

    goToHome() {
        this.winOverlay.classList.add('hidden');
        this.removeTutorialHint();
        this.showScreen(this.homeScreen);
        
        this.savedLevel = this.gameLogic.getSavedProgress();
        if (this.savedLevel > 1) {
            this.continueBtn.classList.remove('hidden');
            this.continueLevelElement.textContent = this.savedLevel;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new GameApp();
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
});
