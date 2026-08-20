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
        
        this.currentLevel = 1;
        this.savedLevel = 1;
        
        this.initializeApp();
        this.setupEventListeners();
    }

    initializeApp() {
        // التحقق من وجود حفظ مسبق
        this.savedLevel = this.gameLogic.getSavedProgress();
        
        if (this.savedLevel > 1) {
            this.continueBtn.classList.remove('hidden');
            this.continueLevelElement.textContent = this.savedLevel;
        }
        
        // إظهار الشاشة الرئيسية
        this.showScreen(this.homeScreen);
    }

    setupEventListeners() {
        // زر بدء اللعب
        this.startBtn.addEventListener('click', () => {
            this.startNewGame();
        });

        // زر المتابعة
        this.continueBtn.addEventListener('click', () => {
            this.startFromLevel(this.savedLevel);
        });

        // زر إعادة المرحلة
        this.resetBtn.addEventListener('click', () => {
            this.resetCurrentLevel();
        });

        // زر المرحلة التالية (في شاشة اللعب)
        this.nextBtn.addEventListener('click', () => {
            this.startNextLevel();
        });

        // زر المرحلة التالية (في overlay الفوز)
        this.overlayNextBtn.addEventListener('click', () => {
            this.startNextLevel();
        });

        // زر الرئيسية (في overlay الفوز)
        this.overlayHomeBtn.addEventListener('click', () => {
            this.goToHome();
        });

        // معالجة أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.resetCurrentLevel();
            }
        });
    }

    showScreen(screen) {
        // إخفاء جميع الشاشات
        this.homeScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.winOverlay.classList.add('hidden');
        
        // إظهار الشاشة المطلوبة
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
        // توليد المرحلة
        this.gameLogic.generateLevel(levelNumber);
        
        // تحديث الواجهة
        this.updateUI();
        
        // إنشاء لوحة اللعب
        this.createBoard();
        
        // إخفاء زر المرحلة التالية
        this.nextBtn.classList.add('hidden');
        
        // حفظ التقدم
        this.gameLogic.saveProgress(levelNumber);
    }

    createBoard() {
        // مسح اللوحة السابقة
        this.boardElement.innerHTML = '';
        
        // تحديد حجم الخلايا
        const boardSize = this.gameLogic.size;
        this.boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
        
        // إنشاء الخلايا
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                // إضافة معالج النقر
                cell.addEventListener('click', () => {
                    this.handleCellClick(i, j);
                });
                
                // إضافة معالج اللمس
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
        
        // الحصول على الخلايا المتأثرة
        const affectedCells = this.gameLogic.getAffectedCells(row, col);
        
        // تطبيق الحركة
        this.gameLogic.toggleCell(row, col);
        this.gameLogic.moves++;
        
        // تحديث عرض اللوحة
        this.updateBoardDisplay();
        this.updateUI();
        
        // إضافة تأثيرات بصرية
        this.applyCellAnimations(affectedCells);
        
        // التحقق من اكتمال المرحلة
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
        // عرض overlay الفوز
        this.winOverlay.classList.remove('hidden');
        
        // إظهار زر المرحلة التالية
        this.nextBtn.classList.remove('hidden');
        
        // حفظ التقدم
        this.gameLogic.saveProgress(this.currentLevel + 1);
        
        // تحديث زر المتابعة في الشاشة الرئيسية
        this.savedLevel = this.currentLevel + 1;
        this.continueBtn.classList.remove('hidden');
        this.continueLevelElement.textContent = this.savedLevel;
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
        this.showScreen(this.homeScreen);
        
        // تحديث زر المتابعة
        this.savedLevel = this.gameLogic.getSavedProgress();
        if (this.savedLevel > 1) {
            this.continueBtn.classList.remove('hidden');
            this.continueLevelElement.textContent = this.savedLevel;
        }
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const app = new GameApp();
    
    // تسجيل Service Worker
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
