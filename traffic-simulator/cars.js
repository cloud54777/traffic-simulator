// Car class and vehicle management for the traffic simulator

class Car {
    constructor(direction, turnDirection) {
        this.id = Utils.generateId();
        this.direction = direction;
        this.turnDirection = turnDirection;
        this.color = Utils.randomCarColor();
        
        // Position and movement
        this.x = 0;
        this.y = 0;
        this.angle = 0;
        this.speed = 0;
        this.targetSpeed = CAR_SETTINGS.DEFAULT_SPEED;
        
        // State management
        this.state = 'approaching'; // approaching, waiting, crossing, exiting
        this.waitTime = 0;
        this.totalWaitTime = 0;
        this.pathIndex = 0;
        this.path = [];
        
        // Physics
        this.width = CAR_SETTINGS.WIDTH;
        this.height = CAR_SETTINGS.HEIGHT;
        
        // Initialize position and path
        this.initializePosition();
        this.calculatePath();
    }

    initializePosition() {
        // Spawn cars outside the visible area
        const spawnDistance = ROAD_LENGTH + 50;
        
        switch (this.direction) {
            case DIRECTIONS.NORTH:
                this.x = CENTER_X - LANE_WIDTH / 2;
                this.y = CENTER_Y + spawnDistance;
                this.angle = -Math.PI / 2; // Facing north
                break;
            case DIRECTIONS.EAST:
                this.x = CENTER_X - spawnDistance;
                this.y = CENTER_Y - LANE_WIDTH / 2;
                this.angle = 0; // Facing east
                break;
            case DIRECTIONS.SOUTH:
                this.x = CENTER_X + LANE_WIDTH / 2;
                this.y = CENTER_Y - spawnDistance;
                this.angle = Math.PI / 2; // Facing south
                break;
            case DIRECTIONS.WEST:
                this.x = CENTER_X + spawnDistance;
                this.y = CENTER_Y + LANE_WIDTH / 2;
                this.angle = Math.PI; // Facing west
                break;
        }
    }

    calculatePath() {
        this.path = [];
        
        // Determine target direction based on turn
        let targetDirection;
        switch (this.turnDirection) {
            case TURNS.STRAIGHT:
                targetDirection = (this.direction + 2) % 4;
                break;
            case TURNS.LEFT:
                targetDirection = (this.direction + 3) % 4;
                break;
            case TURNS.RIGHT:
                targetDirection = (this.direction + 1) % 4;
                break;
        }

        // Generate path points
        if (this.turnDirection === TURNS.STRAIGHT) {
            this.generateStraightPath(targetDirection);
        } else {
            this.generateTurnPath(targetDirection);
        }
    }

    generateStraightPath(targetDirection) {
        // Simple straight line path
        const startX = this.x;
        const startY = this.y;
        
        let endX, endY;
        switch (targetDirection) {
            case DIRECTIONS.NORTH:
                endX = CENTER_X - LANE_WIDTH / 2;
                endY = CENTER_Y - ROAD_LENGTH;
                break;
            case DIRECTIONS.EAST:
                endX = CENTER_X + ROAD_LENGTH;
                endY = CENTER_Y - LANE_WIDTH / 2;
                break;
            case DIRECTIONS.SOUTH:
                endX = CENTER_X + LANE_WIDTH / 2;
                endY = CENTER_Y + ROAD_LENGTH;
                break;
            case DIRECTIONS.WEST:
                endX = CENTER_X - ROAD_LENGTH;
                endY = CENTER_Y + LANE_WIDTH / 2;
                break;
        }

        // Create path points
        const steps = 100;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            this.path.push({
                x: Utils.lerp(startX, endX, t),
                y: Utils.lerp(startY, endY, t),
                angle: this.angle
            });
        }
    }

    generateTurnPath(targetDirection) {
        // Use bezier curves for smooth turning
        const turnPath = Utils.calculateTurnPath(this.direction, targetDirection, CENTER_X, CENTER_Y);
        
        // Convert to path with angles
        for (let i = 0; i < turnPath.length; i++) {
            let angle = this.angle;
            
            // Calculate angle based on direction of movement
            if (i > 0) {
                const dx = turnPath[i].x - turnPath[i - 1].x;
                const dy = turnPath[i].y - turnPath[i - 1].y;
                angle = Math.atan2(dy, dx);
            }
            
            this.path.push({
                x: turnPath[i].x,
                y: turnPath[i].y,
                angle: angle
            });
        }
    }

    update(deltaTime, trafficLights, cars, sensors) {
        // Update wait time if stopped
        if (this.speed < 1) {
            this.waitTime += deltaTime;
            this.totalWaitTime += deltaTime;
        } else {
            this.waitTime = 0;
        }

        // Check traffic light and other cars
        this.updateSpeed(deltaTime, trafficLights, cars, sensors);
        
        // Move along path
        this.move(deltaTime);
        
        // Update state
        this.updateState();
    }

    updateSpeed(deltaTime, trafficLights, cars, sensors) {
        let shouldStop = false;
        
        // Check traffic light
        if (this.state === 'approaching' || this.state === 'waiting') {
            const light = trafficLights.getLightState(this.direction);
            const distanceToStopLine = this.getDistanceToStopLine();
            
            // Stop for red light or if too close to stop on yellow
            if (light === 'red' || (light === 'yellow' && distanceToStopLine < 50)) {
                if (distanceToStopLine > -10) { // Don't stop if already past stop line
                    shouldStop = true;
                }
            }
        }

        // Check for cars ahead
        const carAhead = this.getCarAhead(cars);
        if (carAhead) {
            const distance = Utils.distance(this.x, this.y, carAhead.x, carAhead.y);
            if (distance < PHYSICS.SAFE_DISTANCE) {
                shouldStop = true;
            }
        }

        // Update speed based on conditions
        if (shouldStop) {
            this.speed = Math.max(0, this.speed - CAR_SETTINGS.DECELERATION * deltaTime);
        } else {
            this.speed = Math.min(this.targetSpeed, this.speed + CAR_SETTINGS.ACCELERATION * deltaTime);
        }
    }

    move(deltaTime) {
        if (this.speed > 0 && this.path.length > 0) {
            // Move along the path
            const distance = this.speed * deltaTime;
            let remainingDistance = distance;
            
            while (remainingDistance > 0 && this.pathIndex < this.path.length - 1) {
                const currentPoint = this.path[this.pathIndex];
                const nextPoint = this.path[this.pathIndex + 1];
                
                const segmentLength = Utils.distance(
                    currentPoint.x, currentPoint.y,
                    nextPoint.x, nextPoint.y
                );
                
                if (segmentLength <= remainingDistance) {
                    // Move to next path point
                    this.pathIndex++;
                    remainingDistance -= segmentLength;
                    
                    if (this.pathIndex < this.path.length) {
                        this.x = this.path[this.pathIndex].x;
                        this.y = this.path[this.pathIndex].y;
                        this.angle = this.path[this.pathIndex].angle;
                    }
                } else {
                    // Interpolate position on current segment
                    const t = remainingDistance / segmentLength;
                    this.x = Utils.lerp(currentPoint.x, nextPoint.x, t);
                    this.y = Utils.lerp(currentPoint.y, nextPoint.y, t);
                    this.angle = nextPoint.angle;
                    remainingDistance = 0;
                }
            }
        }
    }

    updateState() {
        const distanceToStopLine = this.getDistanceToStopLine();
        
        if (this.state === 'approaching' && distanceToStopLine <= 0) {
            this.state = 'crossing';
        } else if (this.state === 'crossing' && this.isOutsideIntersection()) {
            this.state = 'exiting';
        }
    }

    getDistanceToStopLine() {
        let stopLineX, stopLineY;
        
        switch (this.direction) {
            case DIRECTIONS.NORTH:
                stopLineX = CENTER_X;
                stopLineY = CENTER_Y + STOP_LINE_DISTANCE;
                break;
            case DIRECTIONS.EAST:
                stopLineX = CENTER_X - STOP_LINE_DISTANCE;
                stopLineY = CENTER_Y;
                break;
            case DIRECTIONS.SOUTH:
                stopLineX = CENTER_X;
                stopLineY = CENTER_Y - STOP_LINE_DISTANCE;
                break;
            case DIRECTIONS.WEST:
                stopLineX = CENTER_X + STOP_LINE_DISTANCE;
                stopLineY = CENTER_Y;
                break;
        }
        
        return Utils.distance(this.x, this.y, stopLineX, stopLineY);
    }

    isOutsideIntersection() {
        const intersectionBounds = {
            left: CENTER_X - INTERSECTION_SIZE / 2,
            right: CENTER_X + INTERSECTION_SIZE / 2,
            top: CENTER_Y - INTERSECTION_SIZE / 2,
            bottom: CENTER_Y + INTERSECTION_SIZE / 2
        };
        
        return this.x < intersectionBounds.left || this.x > intersectionBounds.right ||
               this.y < intersectionBounds.top || this.y > intersectionBounds.bottom;
    }

    getCarAhead(cars) {
        // Find the closest car ahead in the same direction/lane
        let closestCar = null;
        let closestDistance = Infinity;
        
        for (const car of cars) {
            if (car.id === this.id) continue;
            
            // Check if car is in the same lane and ahead
            if (this.isCarInSameLane(car) && this.isCarAhead(car)) {
                const distance = Utils.distance(this.x, this.y, car.x, car.y);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestCar = car;
                }
            }
        }
        
        return closestCar;
    }

    isCarInSameLane(otherCar) {
        // Simplified lane detection - cars going in same direction
        return this.direction === otherCar.direction;
    }

    isCarAhead(otherCar) {
        // Check if the other car is ahead based on direction
        switch (this.direction) {
            case DIRECTIONS.NORTH:
                return otherCar.y < this.y;
            case DIRECTIONS.EAST:
                return otherCar.x > this.x;
            case DIRECTIONS.SOUTH:
                return otherCar.y > this.y;
            case DIRECTIONS.WEST:
                return otherCar.x < this.x;
        }
        return false;
    }

    isOffScreen() {
        const margin = 100;
        return this.x < -margin || this.x > CANVAS_WIDTH + margin ||
               this.y < -margin || this.y > CANVAS_HEIGHT + margin;
    }

    draw(ctx) {
        ctx.save();
        
        // Move to car position and rotate
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2); // Adjust for car sprite orientation
        
        // Draw car body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Draw car outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Draw car details (windows, etc.)
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height / 3);
        
        ctx.restore();
    }
}

// Car manager to handle spawning and managing all cars
class CarManager {
    constructor() {
        this.cars = [];
        this.spawnTimers = {};
        this.stats = new Utils.Stats();
        
        // Initialize spawn timers for each direction
        Object.values(DIRECTIONS).forEach(direction => {
            this.spawnTimers[direction] = 0;
        });
    }

    update(deltaTime, trafficLights, sensors, settings) {
        // Update spawn timers
        this.updateSpawning(deltaTime, settings);
        
        // Update all cars
        for (let i = this.cars.length - 1; i >= 0; i--) {
            const car = this.cars[i];
            car.update(deltaTime, trafficLights, this.cars, sensors);
            
            // Remove cars that are off screen
            if (car.isOffScreen()) {
                this.stats.addCarPassed(car.direction, car.totalWaitTime);
                this.cars.splice(i, 1);
            }
        }
        
        // Update stats
        this.stats.currentCars = this.cars.length;
    }

    updateSpawning(deltaTime, settings) {
        const spawnInterval = 10 / settings.carSpawnRate; // Convert cars per 10s to interval
        
        Object.values(DIRECTIONS).forEach(direction => {
            this.spawnTimers[direction] += deltaTime;
            
            if (this.spawnTimers[direction] >= spawnInterval) {
                this.spawnCar(direction, settings);
                this.spawnTimers[direction] = 0;
            }
        });
    }

    spawnCar(direction, settings) {
        // Determine turn direction based on turn rate
        let turnDirection = TURNS.STRAIGHT;
        const random = Math.random();
        
        if (random < settings.turnRate / 200) { // Half of turn rate for left
            turnDirection = TURNS.LEFT;
        } else if (random < settings.turnRate / 100) { // Other half for right
            turnDirection = TURNS.RIGHT;
        }
        
        const car = new Car(direction, turnDirection);
        car.targetSpeed = settings.carSpeed;
        this.cars.push(car);
    }

    draw(ctx) {
        this.cars.forEach(car => car.draw(ctx));
    }

    reset() {
        this.cars = [];
        this.stats.reset();
        Object.keys(this.spawnTimers).forEach(direction => {
            this.spawnTimers[direction] = 0;
        });
    }

    getCarsInDirection(direction) {
        return this.cars.filter(car => car.direction === direction);
    }

    getWaitingCarsInDirection(direction) {
        return this.cars.filter(car => 
            car.direction === direction && 
            (car.state === 'waiting' || car.state === 'approaching') &&
            car.speed < 1
        );
    }
}