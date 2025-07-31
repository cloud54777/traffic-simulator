// Controllers for managing traffic light modes and priority logic

class TrafficController {
    constructor() {
        this.mode = GAME_MODES.FIXED;
        this.fixedController = new FixedTimerController();
        this.adaptiveController = new AdaptiveController();
        this.currentController = this.fixedController;
    }

    setMode(mode) {
        this.mode = mode;
        
        if (mode === GAME_MODES.FIXED) {
            this.currentController = this.fixedController;
        } else {
            this.currentController = this.adaptiveController;
        }
        
        this.currentController.reset();
    }

    update(deltaTime, trafficLights, carManager, sensors) {
        this.currentController.update(deltaTime, trafficLights, carManager, sensors);
    }

    updateSettings(settings) {
        if (this.mode === GAME_MODES.FIXED) {
            this.fixedController.updateTimings(
                settings.greenDuration,
                settings.yellowDuration,
                settings.redDuration
            );
        } else {
            this.adaptiveController.updateSettings(settings);
        }
    }

    reset() {
        this.fixedController.reset();
        this.adaptiveController.reset();
        this.currentController.reset();
    }

    getCurrentInfo() {
        return this.currentController.getCurrentInfo();
    }
}

class FixedTimerController {
    constructor() {
        this.phase = 0; // Current phase index
        this.phaseTimer = 0; // Time in current phase
        this.phaseDurations = [
            DEFAULT_TIMING.GREEN_DURATION,   // 0: EW green
            DEFAULT_TIMING.YELLOW_DURATION,  // 1: EW yellow
            DEFAULT_TIMING.RED_DURATION,     // 2: All red
            DEFAULT_TIMING.GREEN_DURATION,   // 3: NS green
            DEFAULT_TIMING.YELLOW_DURATION,  // 4: NS yellow
            DEFAULT_TIMING.RED_DURATION      // 5: All red
        ];
        this.phaseNames = [
            'East-West Green',
            'East-West Yellow',
            'All Red',
            'North-South Green', 
            'North-South Yellow',
            'All Red'
        ];
    }

    update(deltaTime, trafficLights, carManager, sensors) {
        this.phaseTimer += deltaTime;
        
        // Check if current phase is complete
        if (this.phaseTimer >= this.phaseDurations[this.phase]) {
            this.advancePhase(trafficLights);
        }
    }

    advancePhase(trafficLights) {
        this.phaseTimer = 0;
        this.phase = (this.phase + 1) % this.phaseDurations.length;
        this.updateTrafficLights(trafficLights);
    }

    updateTrafficLights(trafficLights) {
        switch (this.phase) {
            case 0: // EW green
                trafficLights.lights[DIRECTIONS.NORTH].setState('red');
                trafficLights.lights[DIRECTIONS.SOUTH].setState('red');
                trafficLights.lights[DIRECTIONS.EAST].setState('green');
                trafficLights.lights[DIRECTIONS.WEST].setState('green');
                break;
                
            case 1: // EW yellow
                trafficLights.lights[DIRECTIONS.EAST].setState('yellow');
                trafficLights.lights[DIRECTIONS.WEST].setState('yellow');
                break;
                
            case 2: // All red
                trafficLights.lights[DIRECTIONS.NORTH].setState('red');
                trafficLights.lights[DIRECTIONS.SOUTH].setState('red');
                trafficLights.lights[DIRECTIONS.EAST].setState('red');
                trafficLights.lights[DIRECTIONS.WEST].setState('red');
                break;
                
            case 3: // NS green
                trafficLights.lights[DIRECTIONS.NORTH].setState('green');
                trafficLights.lights[DIRECTIONS.SOUTH].setState('green');
                trafficLights.lights[DIRECTIONS.EAST].setState('red');
                trafficLights.lights[DIRECTIONS.WEST].setState('red');
                break;
                
            case 4: // NS yellow
                trafficLights.lights[DIRECTIONS.NORTH].setState('yellow');
                trafficLights.lights[DIRECTIONS.SOUTH].setState('yellow');
                break;
                
            case 5: // All red
                trafficLights.lights[DIRECTIONS.NORTH].setState('red');
                trafficLights.lights[DIRECTIONS.SOUTH].setState('red');
                trafficLights.lights[DIRECTIONS.EAST].setState('red');
                trafficLights.lights[DIRECTIONS.WEST].setState('red');
                break;
        }
    }

    updateTimings(greenDuration, yellowDuration, redDuration) {
        this.phaseDurations = [
            greenDuration,    // EW green
            yellowDuration,   // EW yellow
            redDuration,      // All red
            greenDuration,    // NS green
            yellowDuration,   // NS yellow
            redDuration       // All red
        ];
    }

    reset() {
        this.phase = 0;
        this.phaseTimer = 0;
    }

    getCurrentInfo() {
        const remaining = this.phaseDurations[this.phase] - this.phaseTimer;
        return {
            phase: this.phaseNames[this.phase],
            remaining: Math.max(0, remaining),
            progress: this.phaseTimer / this.phaseDurations[this.phase]
        };
    }
}

class AdaptiveController {
    constructor() {
        this.currentGreenDirection = null;
        this.greenStartTime = 0;
        this.phaseTimer = 0;
        this.checkInterval = 1.0; // Check priorities every second
        this.lastCheck = 0;
        this.nextDirection = null;
        this.isTransitioning = false;
        this.transitionType = null; // 'yellow' or 'red'
        this.transitionTimer = 0;
        this.transitionDuration = 0;
        
        // Priority calculation weights
        this.carWeight = ADAPTIVE_SETTINGS.PRIORITY_WEIGHT_CARS;
        this.timeWeight = ADAPTIVE_SETTINGS.PRIORITY_WEIGHT_TIME;
        
        // Timing constraints
        this.minGreenTime = ADAPTIVE_SETTINGS.MIN_GREEN_TIME;
        this.maxGreenTime = ADAPTIVE_SETTINGS.MAX_GREEN_TIME;
        this.yellowTime = DEFAULT_TIMING.YELLOW_DURATION;
        this.allRedTime = DEFAULT_TIMING.RED_DURATION;
    }

    update(deltaTime, trafficLights, carManager, sensors) {
        this.phaseTimer += deltaTime;
        this.lastCheck += deltaTime;
        
        if (this.isTransitioning) {
            this.updateTransition(deltaTime, trafficLights, carManager, sensors);
        } else {
            this.updateMainLogic(deltaTime, trafficLights, carManager, sensors);
        }
    }

    updateMainLogic(deltaTime, trafficLights, carManager, sensors) {
        // Periodic priority check
        if (this.lastCheck >= this.checkInterval) {
            this.lastCheck = 0;
            this.checkPriorities(trafficLights, carManager, sensors);
        }
        
        // Force change after maximum green time
        if (this.currentGreenDirection !== null) {
            const greenDuration = this.phaseTimer - this.greenStartTime;
            if (greenDuration >= this.maxGreenTime) {
                this.startTransition('yellow', trafficLights);
            }
        }
    }

    updateTransition(deltaTime, trafficLights, carManager, sensors) {
        this.transitionTimer += deltaTime;
        
        if (this.transitionTimer >= this.transitionDuration) {
            this.completeTransition(trafficLights, carManager, sensors);
        }
    }

    checkPriorities(trafficLights, carManager, sensors) {
        // Don't change if we're in minimum green time
        if (this.currentGreenDirection !== null) {
            const greenDuration = this.phaseTimer - this.greenStartTime;
            if (greenDuration < this.minGreenTime) {
                return;
            }
        }
        
        // Calculate priorities for each direction
        const priorities = this.calculatePriorities(carManager, sensors);
        const bestDirection = this.findBestDirection(priorities);
        
        // Decide whether to switch
        if (bestDirection !== null && bestDirection !== this.currentGreenDirection) {
            const currentPriority = priorities[this.currentGreenDirection] || 0;
            const bestPriority = priorities[bestDirection];
            
            // Switch if the new direction has significantly higher priority
            if (bestPriority > currentPriority + 1.0) {
                this.nextDirection = bestDirection;
                
                if (this.currentGreenDirection === null) {
                    // No current green, start directly
                    this.startGreenPhase(bestDirection, trafficLights);
                } else {
                    // Start transition to new direction
                    this.startTransition('yellow', trafficLights);
                }
            }
        }
    }

    calculatePriorities(carManager, sensors) {
        const priorities = {};
        const sensorData = sensors.getPriorityData();
        
        Object.values(DIRECTIONS).forEach(direction => {
            if (direction === this.currentGreenDirection) {
                priorities[direction] = 0; // Current direction has no priority
                return;
            }
            
            const data = sensorData[direction];
            if (data) {
                // Priority = (number of cars * car weight) + (average wait time * time weight)
                priorities[direction] = 
                    (data.carCount * this.carWeight) + 
                    (data.avgWaitTime * this.timeWeight);
            } else {
                priorities[direction] = 0;
            }
        });
        
        return priorities;
    }

    findBestDirection(priorities) {
        let bestDirection = null;
        let maxPriority = 0;
        
        Object.entries(priorities).forEach(([direction, priority]) => {
            if (priority > maxPriority) {
                maxPriority = priority;
                bestDirection = parseInt(direction);
            }
        });
        
        return maxPriority > 0 ? bestDirection : null;
    }

    startGreenPhase(direction, trafficLights) {
        // Set all lights to red first
        Object.values(trafficLights.lights).forEach(light => {
            light.setState('red');
        });
        
        // Set target direction to green
        trafficLights.lights[direction].setState('green');
        
        this.currentGreenDirection = direction;
        this.greenStartTime = this.phaseTimer;
        this.isTransitioning = false;
        this.nextDirection = null;
    }

    startTransition(type, trafficLights) {
        this.isTransitioning = true;
        this.transitionType = type;
        this.transitionTimer = 0;
        
        if (type === 'yellow') {
            // Start yellow phase
            if (this.currentGreenDirection !== null) {
                trafficLights.lights[this.currentGreenDirection].setState('yellow');
            }
            this.transitionDuration = this.yellowTime;
        } else if (type === 'red') {
            // Start all-red phase
            Object.values(trafficLights.lights).forEach(light => {
                light.setState('red');
            });
            this.transitionDuration = this.allRedTime;
        }
    }

    completeTransition(trafficLights, carManager, sensors) {
        if (this.transitionType === 'yellow') {
            // Yellow phase complete, start all-red
            this.startTransition('red', trafficLights);
        } else if (this.transitionType === 'red') {
            // All-red phase complete
            this.currentGreenDirection = null;
            this.isTransitioning = false;
            
            // Start next green phase if scheduled
            if (this.nextDirection !== null) {
                this.startGreenPhase(this.nextDirection, trafficLights);
            }
        }
    }

    updateSettings(settings) {
        // Update weights and timing constraints if needed
        this.yellowTime = settings.yellowDuration || this.yellowTime;
        this.allRedTime = settings.redDuration || this.allRedTime;
    }

    reset() {
        this.currentGreenDirection = null;
        this.greenStartTime = 0;
        this.phaseTimer = 0;
        this.lastCheck = 0;
        this.nextDirection = null;
        this.isTransitioning = false;
        this.transitionType = null;
        this.transitionTimer = 0;
        this.transitionDuration = 0;
    }

    getCurrentInfo() {
        if (this.isTransitioning) {
            const remaining = this.transitionDuration - this.transitionTimer;
            const phaseName = this.transitionType === 'yellow' ? 
                `${DIRECTION_NAMES[this.currentGreenDirection]} Yellow` : 'All Red';
            
            return {
                phase: phaseName,
                remaining: Math.max(0, remaining),
                progress: this.transitionTimer / this.transitionDuration
            };
        } else if (this.currentGreenDirection !== null) {
            const greenDuration = this.phaseTimer - this.greenStartTime;
            const remaining = this.maxGreenTime - greenDuration;
            
            return {
                phase: `${DIRECTION_NAMES[this.currentGreenDirection]} Green`,
                remaining: Math.max(0, remaining),
                progress: greenDuration / this.maxGreenTime
            };
        } else {
            return {
                phase: 'Adaptive - Waiting',
                remaining: 0,
                progress: 0
            };
        }
    }
}