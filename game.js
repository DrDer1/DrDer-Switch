// ===== DrDer-Switch - منطق اللعبة ومولد المراحل =====

class GameLogic {
    constructor() {
        this.board = [];
        this.size = 0;
        this.moves = 0;
        this.currentLevel = 1;
        this.isComplete = false;
        this.solutionMoves = []; // تخزين الحل الصحيح
    }

    // ===== مولد المراحل =====
    generateLevel(levelNumber) {
        this.currentLevel = levelNumber;
        this.moves = 0;
        this.isComplete = false;
        this.solutionMoves = []; // إعادة تعيين الحل
        
        // تحديد حجم اللوحة بناءً على المرحلة
        this.size = this.getBoardSize(levelNumber);
        
        // إنشاء لوحة فارغة (كلها OFF)
        this.board = this.createEmptyBoard();
        
        // توليد المرحلة باستخدام seed
        const seed = this.generateSeed(levelNumber);
        this.generatePuzzle(seed, levelNumber);
    }

    // تحديد حجم اللوحة حسب رقم المرحلة
    getBoardSize(levelNumber) {
        if (levelNumber <= 20) {
            return 3;
        } else if (levelNumber <= 100) {
            return 4;
        } else if (levelNumber <= 500) {
            return 5;
        } else if (levelNumber <= 2000) {
            return 6;
        } else {
            return 7;
        }
    }

    // إنشاء لوحة فارغة
    createEmptyBoard() {
        const board = [];
        for (let i = 0; i < this.size; i++) {
            board.push(new Array(this.size).fill(false));
        }
        return board;
    }

    // توليد seed من رقم المرحلة
    generateSeed(levelNumber) {
        // استخدام خوارزمية بسيطة لتحويل رقم المرحلة إلى seed
        let seed = levelNumber * 2654435761;
        seed = seed ^ (seed >>> 16);
        seed = seed * 2246822519;
        seed = seed ^ (seed >>> 13);
        return seed >>> 0;
    }

    // مولّد أرقام عشوائية مع seed
    seededRandom(seed) {
        let s = seed;
        return function() {
            s += 0x6D2B79F5;
            let t = s;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // توليد اللغز مع ضمان وجود حل
    generatePuzzle(seed, levelNumber) {
        const random = this.seededRandom(seed);
        
        // تحديد عدد الحركات العكسية بناءً على الصعوبة
        const numMoves = this.getNumMoves(levelNumber);
        
        // أولاً: جعل جميع الخلايا ON (الحالة المحلولة)
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.board[i][j] = true;
            }
        }
        
        // تطبيق حركات عكسية على اللوحة (من الحالة المحلولة إلى الحالة الابتدائية)
        // هذه الحركات هي الحل الصحيح بترتيب عكسي
        const reverseMoves = [];
        
        for (let i = 0; i < numMoves; i++) {
            const row = Math.floor(random() * this.size);
            const col = Math.floor(random() * this.size);
            
            // تطبيق الحركة على اللوحة
            this.toggleCell(row, col);
            
            // تخزين الحركة
            reverseMoves.push([row, col]);
        }
        
        // الحل الصحيح هو عكس ترتيب الحركات
        // (لأننا بدأنا من الحل ووصلنا للحالة الابتدائية)
        this.solutionMoves = reverseMoves.reverse();
    }

    // تحديد عدد الحركات حسب الصعوبة
    getNumMoves(levelNumber) {
        if (levelNumber <= 20) {
            return 3 + Math.floor(levelNumber / 4);
        } else if (levelNumber <= 100) {
            return 8 + Math.floor((levelNumber - 20) / 10);
        } else if (levelNumber <= 500) {
            return 16 + Math.floor((levelNumber - 100) / 20);
        } else if (levelNumber <= 2000) {
            return 36 + Math.floor((levelNumber - 500) / 30);
        } else {
            return 86 + Math.floor((levelNumber - 2000) / 40);
        }
    }

    // تبديل حالة الخلية (مع الخلايا المجاورة)
    toggleCell(row, col) {
        // تبديل الخلية نفسها
        this.board[row][col] = !this.board[row][col];
        
        // تبديل الخلايا المجاورة (فوق، تحت، يمين، يسار)
        const neighbors = [
            [row - 1, col], // فوق
            [row + 1, col], // تحت
            [row, col - 1], // يسار
            [row, col + 1]  // يمين
        ];
        
        for (const [r, c] of neighbors) {
            if (r >= 0 && r < this.size && c >= 0 && c < this.size) {
                this.board[r][c] = !this.board[r][c];
            }
        }
    }

    // التحقق من اكتمال المرحلة
    checkComplete() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (!this.board[i][j]) {
                    return false;
                }
            }
        }
        this.isComplete = true;
        return true;
    }

    // إعادة تعيين المرحلة
    resetLevel() {
        this.generateLevel(this.currentLevel);
    }

    // الحصول على الخلايا المتأثرة
    getAffectedCells(row, col) {
        const affected = [[row, col]];
        const neighbors = [
            [row - 1, col],
            [row + 1, col],
            [row, col - 1],
            [row, col + 1]
        ];
        
        for (const [r, c] of neighbors) {
            if (r >= 0 && r < this.size && c >= 0 && c < this.size) {
                affected.push([r, c]);
            }
        }
        
        return affected;
    }

    // الحصول على الحل الصحيح للمرحلة
    getSolution() {
        return this.solutionMoves;
    }

    // التحقق من وجود حفظ مسبق
    getSavedProgress() {
        try {
            const saved = localStorage.getItem('drder-switch-progress');
            if (saved) {
                const progress = JSON.parse(saved);
                return progress.lastLevel || 1;
            }
        } catch (e) {
            console.error('Error loading progress:', e);
        }
        return 1;
    }

    // حفظ التقدم
    saveProgress(levelNumber) {
        try {
            const progress = {
                lastLevel: levelNumber,
                timestamp: Date.now()
            };
            localStorage.setItem('drder-switch-progress', JSON.stringify(progress));
        } catch (e) {
            console.error('Error saving progress:', e);
        }
    }

    // مسح التقدم
    clearProgress() {
        try {
            localStorage.removeItem('drder-switch-progress');
        } catch (e) {
            console.error('Error clearing progress:', e);
        }
    }
}

// إنشاء نسخة عامة من منطق اللعبة
const gameLogic = new GameLogic();
