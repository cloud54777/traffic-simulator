// Traffic light system for the 4-way intersection

class TrafficLight {
    constructor(direction, x, y) {
        this.direction = direction;
        this.x = x;
        this.y = y;
        this.state = 'red'; // red, yellow, green
        this.width = 16;
        this.height = 48;
        this.lightRadius = 6;
    }

    setState(state) {
        this.state = state;
    }

    draw(ctx) {
        // Draw traffic light pole
        ctx.fillStyle = '#444';
        ctx.fillRect(this.x - 2, this.y, 4, 60);
        
        // Draw traffic light box
        ctx.fillStyle = '#222';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height, this.width, this.height);
        
        // Draw light outline
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - this.width / 2, this.y - this.height, this.width, this.height);
        
        // Draw the three lights
        const lightSpacing = 14;
        const startY = this.y - this.height + 8;
        
        // Red light
        ctx.fillStyle = this.state === 'red' ? LIGHT_COLORS.RED : LIGHT_COLORS.OFF;
        ctx.beginPath();
        ctx.arc(this.x, startY, this.lightRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Yellow light
        ctx.fillStyle = this.state === 'yellow' ? LIGHT_COLORS.YELLOW : LIGHT_COLORS.OFF;
        ctx.beginPath();
        ctx.arc(this.x, startY + lightSpacing, this.lightRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Green light
        ctx.fillStyle = this.state === 'green' ? LIGHT_COLORS.GREEN : LIGHT_COLORS.OFF;
        ctx.beginPath();
        ctx.arc(this.x, startY + lightSpacing * 2, this.lightRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add glow effect for active light
        if (this.state !== 'red') {
            ctx.shadowColor = this.state === 'green' ? LIGHT_COLORS.GREEN : LIGHT_COLORS.YELLOW;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(this.x, startY + (this.state === 'green' ? lightSpacing * 2 : lightSpacing), 
                   this.lightRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

class TrafficLightManager {
    constructor() {
        this.lights = {};
        this.mode = GAME_MODES.FIXED;
        this.currentPhase = 0; // 0: EW green, 1: EW yellow, 2: all red, 3: NS green, 4: NS yellow, 5: all red
        this.phaseTimer = 0;
        this.phaseDurations = [
            DEFAULT_TIMING.GREEN_DURATION,   // EW green
            DEFAULT_TIMING.YELLOW_DURATION,  // EW yellow  
            DEFAULT_TIMING.RED_DURATION,     // All red
            DEFAULT_TIMING.GREEN_DURATION,   // NS green
            DEFAULT_TIMING.YELLOW_DURATION,  // NS yellow
            DEFAULT_TIMING.RED_DURATION      // All red
        ];
        
        // Adaptive mode variables
        this.adaptiveTimer = 0;
        this.lastAdaptiveCheck = 0;
        this.currentGreenDirection = null;
        this.greenStartTime = 0;
        
        this.initializeLights();
        this.setInitialStates();
    }

    initializeLights() {
        // Position traffic lights just before the stop lines
        const lightOffset = 25;
        
        this.lights[DIRECTIONS.NORTH] = new TrafficLight(
            DIRECTIONS.NORTH,
            CENTER_X - LANE_WIDTH / 2,
            CENTER_Y + STOP_LINE_DISTANCE + lightOffset
        );
        
        this.lights[DIRECTIONS.EAST] = new TrafficLight(
            DIRECTIONS.EAST,
            CENTER_X - STOP_LINE_DISTANCE - lightOffset,
            CENTER_Y - LANE_WIDTH / 2
        );
        
        this.lights[DIRECTIONS.SOUTH] = new TrafficLight(
            DIRECTIONS.SOUTH,
            CENTER_X + LANE_WIDTH / 2,
            CENTER_Y - STOP_LINE_DISTANCE - lightOffset
        );
        
        this.lights[DIRECTIONS.WEST] = new TrafficLight(
            DIRECTIONS.WEST,
            CENTER_X + STOP_LINE_DISTANCE + lightOffset,
            CENTER_Y + LANE_WIDTH / 2
        );
    }

    setInitialStates() {
        // Start with East-West green
        this.lights[DIRECTIONS.NORTH].setState('red');
        this.lights[DIRECTIONS.SOUTH].setState('red');
        this.lights[DIRECTIONS.EAST].setState('green');
        this.lights[DIRECTIONS.WEST].setState('green');
        
        this.currentPhase = 0;
        this.phaseTimer = 0;
    }

    setMode(mode) {
        this.mode = mode;
        
        if (mode === GAME_MODES.ADAPTIVE) {
            // Reset to all red for adaptive mode
            Object.values(this.lights).forEach(light => light.setState('red'));
            this.currentGreenDirection = null;
            this.greenStartTime = 0;
            this.adaptiveTimer = 0;
        } else {
            // Reset to fixed timer mode
            this.setInitialStates();
        }
    }

    updateTimings(greenDuration, yellowDuration, redDuration) {
        this.phaseDurations = [
            greenDuration,   // EW green
            yellowDuration,  // EW yellow  
            redDuration,     // All red
            greenDuration,   // NS green
            yellowDuration,  // NS yellow
            redDuration      // All red
        ];
    }

    update(deltaTime, carManager, sensors) {
        if (this.mode === GAME_MODES.FIXED) {
            this.updateFixedTimer(deltaTime);
        } else {
            this.updateAdaptiveTimer(deltaTime, carManager, sensors);
        }
    }

    updateFixedTimer(deltaTime) {
        this.phaseTimer += deltaTime;
        
        if (this.phaseTimer >= this.phaseDurations[this.currentPhase]) {
            this.phaseTimer = 0;
            this.currentPhase = (this.currentPhase + 1) % this.phaseDurations.length;
            this.updateLightStates();
        }
    }

    updateAdaptiveTimer(deltaTime, carManager, sensors) {
        this.adaptiveTimer += deltaTime;
        
        // Check for priority changes every second
        if (this.adaptiveTimer - this.lastAdaptiveCheck >= 1.0) {
            this.lastAdaptiveCheck = this.adaptiveTimer;
            this.checkAdaptivePriority(carManager, sensors);
        }
        
        // Handle current green light duration
        if (this.currentGreenDirection !== null) {
            const greenDuration = this.adaptiveTimer - this.greenStartTime;
            
            // Force yellow after maximum green time
            if (greenDuration >= ADAPTIVE_SETTINGS.MAX_GREEN_TIME) {
                this.startYellowPhase(this.currentGreenDirection);
            }
        }
    }

    checkAdaptivePriority(carManager, sensors) {
        if (this.currentGreenDirection !== null) {
            // If we're in green phase, check if we should switch
            const greenDuration = this.adaptiveTimer - this.greenStartTime;
            
            // Don't switch if we haven't met minimum green time
            if (greenDuration < ADAPTIVE_SETTINGS.MIN_GREEN_TIME) {
                return;
            }
        }
        
        // Calculate priority for each direction
        const priorities = {};
        let maxPriority = 0;
        let bestDirection = null;
        
        Object.values(DIRECTIONS).forEach(direction => {
            if (direction === this.currentGreenDirection) {
                priorities[direction] = 0; // Current green direction has no priority
                return;
            }
            
            const waitingCars = carManager.getWaitingCarsInDirection(direction);
            const carCount = waitingCars.length;
            
            // Calculate average wait time for cars in this direction
            let avgWaitTime = 0;
            if (carCount > 0) {
                const totalWaitTime = waitingCars.reduce((sum, car) => sum + car.waitTime, 0);
                avgWaitTime = totalWaitTime / carCount;
            }
            
            // Calculate priority score
            const priority = carCount * ADAPTIVE_SETTINGS.PRIORITY_WEIGHT_CARS + 
                           avgWaitTime * ADAPTIVE_SETTINGS.PRIORITY_WEIGHT_TIME;
            
            priorities[direction] = priority;
            
            if (priority > maxPriority) {
                maxPriority = priority;
                bestDirection = direction;
            }
        });
        
        // Switch to new direction if it has significantly higher priority
        if (bestDirection !== null && maxPriority > 1.0) {
            if (this.currentGreenDirection === null) {
                // No current green light, start new green phase
                this.startGreenPhase(bestDirection);
            } else {
                // Start yellow phase to transition
                this.startYellowPhase(this.currentGreenDirection);
                this.nextGreenDirection = bestDirection;
            }
        }
    }

    startGreenPhase(direction) {
        // Set all lights to red first
        Object.values(this.lights).forEach(light => light.setState('red'));
        
        // Set the target direction to green
        this.lights[direction].setState('green');
        this.currentGreenDirection = direction;
        this.greenStartTime = this.adaptiveTimer;
    }

    startYellowPhase(direction) {
        this.lights[direction].setState('yellow');
        
        // Set timer to transition to all-red after yellow duration
        setTimeout(() => {
            this.lights[direction].setState('red');
            
            // After red phase, start next green if scheduled
            setTimeout(() => {
                if (this.nextGreenDirection !== null) {
                    this.startGreenPhase(this.nextGreenDirection);
                    this.nextGreenDirection = null;
                } else {
                    this.currentGreenDirection = null;
                }
            }, DEFAULT_TIMING.RED_DURATION * 1000);
            
        }, DEFAULT_TIMING.YELLOW_DURATION * 1000);
        
        this.currentGreenDirection = null;
    }

    updateLightStates() {
        // Update lights based on current phase (fixed timer mode)
        switch (this.currentPhase) {
            case 0: // EW green
                this.lights[DIRECTIONS.NORTH].setState('red');
                this.lights[DIRECTIONS.SOUTH].setState('red');
                this.lights[DIRECTIONS.EAST].setState('green');
                this.lights[DIRECTIONS.WEST].setState('green');
                break;
            case 1: // EW yellow
                this.lights[DIRECTIONS.EAST].setState('yellow');
                this.lights[DIRECTIONS.WEST].setState('yellow');
                break;
            case 2: // All red
                this.lights[DIRECTIONS.NORTH].setState('red');
                this.lights[DIRECTIONS.SOUTH].setState('red');
                this.lights[DIRECTIONS.EAST].setState('red');
                this.lights[DIRECTIONS.WEST].setState('red');
                break;
            case 3: // NS green
                this.lights[DIRECTIONS.NORTH].setState('green');
                this.lights[DIRECTIONS.SOUTH].setState('green');
                this.lights[DIRECTIONS.EAST].setState('red');
                this.lights[DIRECTIONS.WEST].setState('red');
                break;
            case 4: // NS yellow
                this.lights[DIRECTIONS.NORTH].setState('yellow');
                this.lights[DIRECTIONS.SOUTH].setState('yellow');
                break;
            case 5: // All red
                this.lights[DIRECTIONS.NORTH].setState('red');
                this.lights[DIRECTIONS.SOUTH].setState('red');
                this.lights[DIRECTIONS.EAST].setState('red');
                this.lights[DIRECTIONS.WEST].setState('red');
                break;
        }
    }

    getLightState(direction) {
        return this.lights[direction] ? this.lights[direction].state : 'red';
    }

    getRemainingTime() {
        if (this.mode === GAME_MODES.FIXED) {
            return this.phaseDurations[this.currentPhase] - this.phaseTimer;
        } else {
            if (this.currentGreenDirection !== null) {
                const greenDuration = this.adaptiveTimer - this.greenStartTime;
                return ADAPTIVE_SETTINGS.MAX_GREEN_TIME - greenDuration;
            }
            return 0;
        }
    }

    getCurrentPhaseInfo() {
        if (this.mode === GAME_MODES.FIXED) {
            const phaseNames = ['EW Green', 'EW Yellow', 'All Red', 'NS Green', 'NS Yellow', 'All Red'];
            return {
                name: phaseNames[this.currentPhase],
                remaining: this.getRemainingTime()
            };
        } else {
            if (this.currentGreenDirection !== null) {
                return {
                    name: `${DIRECTION_NAMES[this.currentGreenDirection]} Green`,
                    remaining: this.getRemainingTime()
                };
            }
            return { name: 'Adaptive Mode', remaining: 0 };
        }
    }

    draw(ctx) {
        // Draw all traffic lights
        Object.values(this.lights).forEach(light => light.draw(ctx));
        
        // Draw phase info
        if (this.mode === GAME_MODES.FIXED) {
            this.drawPhaseInfo(ctx);
        }
    }

    drawPhaseInfo(ctx) {
        const phaseInfo = this.getCurrentPhaseInfo();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 50);
        
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`Phase: ${phaseInfo.name}`, 20, 30);
        ctx.fillText(`Time: ${phaseInfo.remaining.toFixed(1)}s`, 20, 50);
    }

    reset() {
        this.setInitialStates();
        this.adaptiveTimer = 0;
        this.lastAdaptiveCheck = 0;
        this.currentGreenDirection = null;
        this.greenStartTime = 0;
        this.nextGreenDirection = null;
    }
}