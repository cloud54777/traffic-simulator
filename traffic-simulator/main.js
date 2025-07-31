// Main game entry point and coordination for the 4-Way Traffic Simulator

class TrafficSimulatorGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.animationFrameId = null;
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Game components
        this.intersection = null;
        this.carManager = null;
        this.trafficLights = null;
        this.sensors = null;
        this.trafficController = null;
        this.ui = null;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        
        this.initialize();
    }

    initialize() {
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize game components
        this.intersection = new Intersection();
        this.carManager = new CarManager();
        this.trafficLights = new TrafficLightManager();
        this.sensors = new SensorManager();
        this.trafficController = new TrafficController();
        this.ui = new UIController();
        
        // Setup UI callbacks
        this.setupUICallbacks();
        
        // Apply initial settings
        this.applySettings(this.ui.getSettings());
        
        // Start the game loop
        this.start();
        
        console.log('Traffic Simulator initialized successfully!');
        this.ui.showNotification('Traffic Simulator Ready!', 'success');
    }

    setupUICallbacks() {
        // Mode change callback
        this.ui.setOnModeChangeCallback((mode) => {
            this.trafficController.setMode(mode);
            this.trafficLights.setMode(mode);
            
            // Show sensors only in adaptive mode
            this.sensors.setActive(mode === GAME_MODES.ADAPTIVE);
            
            this.ui.showNotification(`Switched to ${mode.toUpperCase()} mode`, 'info');
        });

        // Play/Pause callback
        this.ui.setOnPlayPauseCallback((isRunning) => {
            this.isPaused = !isRunning;
            if (isRunning) {
                this.ui.showNotification('Simulation resumed', 'success');
            } else {
                this.ui.showNotification('Simulation paused', 'warning');
            }
        });

        // Reset callback
        this.ui.setOnResetCallback(() => {
            this.reset();
            this.ui.showNotification('Simulation reset', 'info');
        });

        // Settings change callback
        this.ui.setOnSettingsChangeCallback((settings) => {
            this.applySettings(settings);
        });
    }

    applySettings(settings) {
        // Update traffic light timings
        this.trafficLights.updateTimings(
            settings.greenDuration,
            settings.yellowDuration,
            settings.redDuration
        );
        
        // Update traffic controller
        this.trafficController.updateSettings(settings);
        
        // Update sensor distance
        this.sensors.setDetectorDistance(settings.detectorDistance);
        
        // Car settings are applied in the car manager during spawning
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    reset() {
        // Reset all components
        this.carManager.reset();
        this.trafficLights.reset();
        this.sensors.reset();
        this.trafficController.reset();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Re-apply settings
        this.applySettings(this.ui.getSettings());
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        // Limit delta time to prevent large jumps
        this.deltaTime = Math.min(this.deltaTime, 1/30); // Max 30 FPS equivalent
        
        if (!this.isPaused) {
            this.update(this.deltaTime);
        }
        
        this.render();
        
        // Continue the game loop
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        const settings = this.ui.getSettings();
        
        // Update sensors
        this.sensors.update(this.carManager.cars);
        
        // Update traffic controller
        this.trafficController.update(
            deltaTime,
            this.trafficLights,
            this.carManager,
            this.sensors
        );
        
        // Update traffic lights
        this.trafficLights.update(deltaTime, this.carManager, this.sensors);
        
        // Update cars
        this.carManager.update(deltaTime, this.trafficLights, this.sensors, settings);
        
        // Update UI statistics
        this.ui.updateStats(this.carManager.stats);
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw intersection
        this.intersection.draw(this.ctx);
        
        // Draw sensors (if enabled)
        if (this.ui.shouldShowSensors()) {
            this.sensors.draw(this.ctx, true);
        }
        
        // Draw cars
        this.carManager.draw(this.ctx);
        
        // Draw traffic lights
        this.trafficLights.draw(this.ctx);
        
        // Draw UI overlays
        this.ui.drawPhaseInfo(this.ctx, this.trafficController);
        this.ui.drawModeIndicator(this.ctx, this.ui.getSettings().mode);
        
        // Draw performance info (optional)
        if (this.shouldShowDebugInfo()) {
            this.drawDebugInfo();
        }
    }

    drawDebugInfo() {
        const fps = Math.round(1 / this.deltaTime);
        const carCount = this.carManager.cars.length;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, CANVAS_HEIGHT - 80, 200, 70);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`FPS: ${fps}`, 20, CANVAS_HEIGHT - 60);
        this.ctx.fillText(`Cars: ${carCount}`, 20, CANVAS_HEIGHT - 45);
        this.ctx.fillText(`Delta: ${(this.deltaTime * 1000).toFixed(1)}ms`, 20, CANVAS_HEIGHT - 30);
        this.ctx.fillText(`Mode: ${this.ui.getSettings().mode}`, 20, CANVAS_HEIGHT - 15);
    }

    shouldShowDebugInfo() {
        // Show debug info if 'D' key is held (you can implement key tracking)
        return false; // Set to true to always show debug info
    }

    // Handle canvas resize
    handleResize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth - 40; // Account for padding
        const aspectRatio = CANVAS_HEIGHT / CANVAS_WIDTH;
        
        if (containerWidth < CANVAS_WIDTH) {
            this.canvas.style.width = containerWidth + 'px';
            this.canvas.style.height = (containerWidth * aspectRatio) + 'px';
        } else {
            this.canvas.style.width = CANVAS_WIDTH + 'px';
            this.canvas.style.height = CANVAS_HEIGHT + 'px';
        }
    }

    // Export simulation data (optional feature)
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            settings: this.ui.getSettings(),
            stats: {
                totalCarsPassed: this.carManager.stats.totalCarsPassed,
                averageWaitTime: this.carManager.stats.getAverageWaitTime(),
                currentCars: this.carManager.stats.currentCars,
                directionStats: this.carManager.stats.directionStats
            },
            sensorStats: this.sensors.getStats()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `traffic-simulation-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.ui.showNotification('Data exported successfully!', 'success');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new TrafficSimulatorGame();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            game.handleResize();
        });
        
        // Initial resize
        game.handleResize();
        
        // Add export functionality (optional)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                game.exportData();
            }
        });
        
        // Make game globally accessible for debugging
        window.trafficGame = game;
        
    } catch (error) {
        console.error('Failed to initialize Traffic Simulator:', error);
        alert('Failed to load the traffic simulator. Please check the console for errors.');
    }
});

// Handle page visibility changes (pause when tab is not visible)
document.addEventListener('visibilitychange', () => {
    if (window.trafficGame) {
        if (document.hidden) {
            window.trafficGame.isPaused = true;
        } else {
            // Don't automatically resume - let user control this
        }
    }
});