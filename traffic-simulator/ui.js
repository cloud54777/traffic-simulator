// UI controller for handling user interactions and display updates

class UIController {
    constructor() {
        this.elements = {};
        this.settings = {
            mode: GAME_MODES.FIXED,
            greenDuration: DEFAULT_TIMING.GREEN_DURATION,
            yellowDuration: DEFAULT_TIMING.YELLOW_DURATION,
            redDuration: DEFAULT_TIMING.RED_DURATION,
            carSpawnRate: CAR_SETTINGS.SPAWN_RATE,
            carSpeed: CAR_SETTINGS.DEFAULT_SPEED,
            turnRate: CAR_SETTINGS.TURN_RATE * 100, // Convert to percentage
            detectorDistance: SENSOR_SETTINGS.DEFAULT_DISTANCE
        };
        
        this.gameRunning = true;
        this.showSensors = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateUI();
    }

    initializeElements() {
        // Get all UI elements
        this.elements = {
            // Mode and controls
            modeSelector: document.getElementById('modeSelector'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            
            // Timing controls
            greenDuration: document.getElementById('greenDuration'),
            yellowDuration: document.getElementById('yellowDuration'),
            redDuration: document.getElementById('redDuration'),
            greenValue: document.getElementById('greenValue'),
            yellowValue: document.getElementById('yellowValue'),
            redValue: document.getElementById('redValue'),
            
            // Car controls
            carSpawnRate: document.getElementById('carSpawnRate'),
            carSpeed: document.getElementById('carSpeed'),
            turnRate: document.getElementById('turnRate'),
            spawnValue: document.getElementById('spawnValue'),
            speedValue: document.getElementById('speedValue'),
            turnValue: document.getElementById('turnValue'),
            
            // Sensor controls
            detectorDistance: document.getElementById('detectorDistance'),
            detectorValue: document.getElementById('detectorValue'),
            adaptiveControls: document.getElementById('adaptiveControls'),
            
            // Statistics
            totalCarsPassed: document.getElementById('totalCarsPassed'),
            avgWaitTime: document.getElementById('avgWaitTime'),
            currentCars: document.getElementById('currentCars')
        };
    }

    setupEventListeners() {
        // Mode selector
        this.elements.modeSelector.addEventListener('change', (e) => {
            this.settings.mode = e.target.value;
            this.onModeChange(this.settings.mode);
        });

        // Control buttons
        this.elements.playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });

        this.elements.resetBtn.addEventListener('click', () => {
            this.onReset();
        });

        // Timing sliders
        this.elements.greenDuration.addEventListener('input', (e) => {
            this.settings.greenDuration = parseInt(e.target.value);
            this.elements.greenValue.textContent = this.settings.greenDuration;
            this.onSettingsChange();
        });

        this.elements.yellowDuration.addEventListener('input', (e) => {
            this.settings.yellowDuration = parseInt(e.target.value);
            this.elements.yellowValue.textContent = this.settings.yellowDuration;
            this.onSettingsChange();
        });

        this.elements.redDuration.addEventListener('input', (e) => {
            this.settings.redDuration = parseInt(e.target.value);
            this.elements.redValue.textContent = this.settings.redDuration;
            this.onSettingsChange();
        });

        // Car control sliders
        this.elements.carSpawnRate.addEventListener('input', (e) => {
            this.settings.carSpawnRate = parseInt(e.target.value);
            this.elements.spawnValue.textContent = this.settings.carSpawnRate;
            this.onSettingsChange();
        });

        this.elements.carSpeed.addEventListener('input', (e) => {
            this.settings.carSpeed = parseInt(e.target.value);
            this.elements.speedValue.textContent = this.settings.carSpeed;
            this.onSettingsChange();
        });

        this.elements.turnRate.addEventListener('input', (e) => {
            this.settings.turnRate = parseInt(e.target.value);
            this.elements.turnValue.textContent = this.settings.turnRate;
            this.onSettingsChange();
        });

        // Sensor control slider
        this.elements.detectorDistance.addEventListener('input', (e) => {
            this.settings.detectorDistance = parseInt(e.target.value);
            this.elements.detectorValue.textContent = this.settings.detectorDistance;
            this.onSettingsChange();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'r':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.onReset();
                    }
                    break;
                case 's':
                    e.preventDefault();
                    this.toggleSensors();
                    break;
            }
        });
    }

    onModeChange(mode) {
        // Show/hide adaptive controls
        if (mode === GAME_MODES.ADAPTIVE) {
            this.elements.adaptiveControls.style.display = 'block';
            this.showSensors = true;
        } else {
            this.elements.adaptiveControls.style.display = 'none';
            this.showSensors = false;
        }
        
        // Notify game of mode change
        if (this.onModeChangeCallback) {
            this.onModeChangeCallback(mode);
        }
    }

    togglePlayPause() {
        this.gameRunning = !this.gameRunning;
        this.elements.playPauseBtn.textContent = this.gameRunning ? '⏸️ Pause' : '▶️ Play';
        
        if (this.onPlayPauseCallback) {
            this.onPlayPauseCallback(this.gameRunning);
        }
    }

    toggleSensors() {
        this.showSensors = !this.showSensors;
    }

    onReset() {
        if (this.onResetCallback) {
            this.onResetCallback();
        }
    }

    onSettingsChange() {
        if (this.onSettingsChangeCallback) {
            this.onSettingsChangeCallback(this.settings);
        }
    }

    updateUI() {
        // Update all slider values
        this.elements.greenValue.textContent = this.settings.greenDuration;
        this.elements.yellowValue.textContent = this.settings.yellowDuration;
        this.elements.redValue.textContent = this.settings.redDuration;
        this.elements.spawnValue.textContent = this.settings.carSpawnRate;
        this.elements.speedValue.textContent = this.settings.carSpeed;
        this.elements.turnValue.textContent = this.settings.turnRate;
        this.elements.detectorValue.textContent = this.settings.detectorDistance;
        
        // Set slider positions
        this.elements.greenDuration.value = this.settings.greenDuration;
        this.elements.yellowDuration.value = this.settings.yellowDuration;
        this.elements.redDuration.value = this.settings.redDuration;
        this.elements.carSpawnRate.value = this.settings.carSpawnRate;
        this.elements.carSpeed.value = this.settings.carSpeed;
        this.elements.turnRate.value = this.settings.turnRate;
        this.elements.detectorDistance.value = this.settings.detectorDistance;
        
        // Set mode selector
        this.elements.modeSelector.value = this.settings.mode;
        this.onModeChange(this.settings.mode);
    }

    updateStats(stats) {
        if (!stats) return;
        
        this.elements.totalCarsPassed.textContent = stats.totalCarsPassed;
        this.elements.avgWaitTime.textContent = Utils.formatTime(stats.getAverageWaitTime());
        this.elements.currentCars.textContent = stats.currentCars;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '1000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        // Set background color based on type
        switch(type) {
            case 'success':
                notification.style.backgroundColor = '#2ed573';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffa502';
                break;
            case 'error':
                notification.style.backgroundColor = '#ff4757';
                break;
            default:
                notification.style.backgroundColor = '#667eea';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    drawPhaseInfo(ctx, trafficController) {
        const info = trafficController.getCurrentInfo();
        if (!info) return;
        
        // Draw phase info box
        const boxWidth = 220;
        const boxHeight = 80;
        const boxX = 10;
        const boxY = 10;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Border
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Current Phase:', boxX + 10, boxY + 25);
        
        ctx.font = '14px Arial';
        ctx.fillText(info.phase, boxX + 10, boxY + 45);
        
        if (info.remaining > 0) {
            ctx.fillText(`Remaining: ${info.remaining.toFixed(1)}s`, boxX + 10, boxY + 65);
        }
        
        // Progress bar
        if (info.progress !== undefined) {
            const progressBarX = boxX + 120;
            const progressBarY = boxY + 50;
            const progressBarWidth = 80;
            const progressBarHeight = 8;
            
            // Background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
            
            // Progress
            ctx.fillStyle = '#667eea';
            ctx.fillRect(progressBarX, progressBarY, progressBarWidth * info.progress, progressBarHeight);
        }
    }

    drawModeIndicator(ctx, mode) {
        const text = mode === GAME_MODES.FIXED ? 'FIXED TIMER' : 'ADAPTIVE';
        const color = mode === GAME_MODES.FIXED ? '#2ed573' : '#ff6b6b';
        
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(CANVAS_WIDTH - 150, 10, 140, 30);
        
        ctx.fillStyle = color;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, CANVAS_WIDTH - 80, 30);
        ctx.restore();
    }

    // Callback setters
    setOnModeChangeCallback(callback) {
        this.onModeChangeCallback = callback;
    }

    setOnPlayPauseCallback(callback) {
        this.onPlayPauseCallback = callback;
    }

    setOnResetCallback(callback) {
        this.onResetCallback = callback;
    }

    setOnSettingsChangeCallback(callback) {
        this.onSettingsChangeCallback = callback;
    }

    getSettings() {
        return { ...this.settings };
    }

    isGameRunning() {
        return this.gameRunning;
    }

    shouldShowSensors() {
        return this.showSensors;
    }
}