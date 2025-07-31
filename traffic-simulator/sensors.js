// Sensor detection system for adaptive traffic light mode

class DetectionSensor {
    constructor(direction, x, y, width, height) {
        this.direction = direction;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.detectedCars = [];
        this.active = true;
    }

    update(cars) {
        // Clear previous detections
        this.detectedCars = [];
        
        if (!this.active) return;
        
        // Check each car for detection
        cars.forEach(car => {
            if (this.isCarDetected(car)) {
                this.detectedCars.push(car);
            }
        });
    }

    isCarDetected(car) {
        // Only detect cars approaching from the same direction
        if (car.direction !== this.direction) return false;
        
        // Check if car is within detection zone
        return car.x >= this.x && 
               car.x <= this.x + this.width &&
               car.y >= this.y && 
               car.y <= this.y + this.height;
    }

    getDetectedCarCount() {
        return this.detectedCars.length;
    }

    getWaitingCars() {
        return this.detectedCars.filter(car => 
            (car.state === 'waiting' || car.state === 'approaching') && 
            car.speed < 1
        );
    }

    draw(ctx) {
        if (!this.active) return;
        
        // Draw detection zone with translucent overlay
        ctx.fillStyle = VISUAL.DETECTION_ZONE_COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw border
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.setLineDash([]);
        
        // Draw detection info
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(centerX - 25, centerY - 10, 50, 20);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.getDetectedCarCount()}`, centerX, centerY + 4);
        ctx.textAlign = 'left';
    }
}

class SensorManager {
    constructor() {
        this.sensors = {};
        this.detectorDistance = SENSOR_SETTINGS.DEFAULT_DISTANCE;
        this.initializeSensors();
    }

    initializeSensors() {
        const sensorWidth = SENSOR_SETTINGS.WIDTH;
        const sensorHeight = 20;
        
        // Calculate sensor positions based on detector distance
        this.updateSensorPositions();
    }

    updateSensorPositions() {
        const sensorWidth = SENSOR_SETTINGS.WIDTH;
        const sensorHeight = 20;
        
        // North sensor (cars coming from south going north)
        this.sensors[DIRECTIONS.NORTH] = new DetectionSensor(
            DIRECTIONS.NORTH,
            CENTER_X - sensorWidth / 2,
            CENTER_Y + STOP_LINE_DISTANCE + this.detectorDistance,
            sensorWidth,
            sensorHeight
        );
        
        // East sensor (cars coming from west going east)
        this.sensors[DIRECTIONS.EAST] = new DetectionSensor(
            DIRECTIONS.EAST,
            CENTER_X - STOP_LINE_DISTANCE - this.detectorDistance - sensorHeight,
            CENTER_Y - sensorWidth / 2,
            sensorHeight,
            sensorWidth
        );
        
        // South sensor (cars coming from north going south)
        this.sensors[DIRECTIONS.SOUTH] = new DetectionSensor(
            DIRECTIONS.SOUTH,
            CENTER_X - sensorWidth / 2,
            CENTER_Y - STOP_LINE_DISTANCE - this.detectorDistance - sensorHeight,
            sensorWidth,
            sensorHeight
        );
        
        // West sensor (cars coming from east going west)
        this.sensors[DIRECTIONS.WEST] = new DetectionSensor(
            DIRECTIONS.WEST,
            CENTER_X + STOP_LINE_DISTANCE + this.detectorDistance,
            CENTER_Y - sensorWidth / 2,
            sensorHeight,
            sensorWidth
        );
    }

    setDetectorDistance(distance) {
        this.detectorDistance = Utils.clamp(
            distance, 
            SENSOR_SETTINGS.MIN_DISTANCE, 
            SENSOR_SETTINGS.MAX_DISTANCE
        );
        this.updateSensorPositions();
    }

    update(cars) {
        Object.values(this.sensors).forEach(sensor => {
            sensor.update(cars);
        });
    }

    getDetectedCarsInDirection(direction) {
        const sensor = this.sensors[direction];
        return sensor ? sensor.getDetectedCarCount() : 0;
    }

    getWaitingCarsInDirection(direction) {
        const sensor = this.sensors[direction];
        return sensor ? sensor.getWaitingCars() : [];
    }

    // Get priority data for adaptive traffic light system
    getPriorityData() {
        const data = {};
        
        Object.values(DIRECTIONS).forEach(direction => {
            const sensor = this.sensors[direction];
            if (sensor) {
                const waitingCars = sensor.getWaitingCars();
                const carCount = waitingCars.length;
                
                // Calculate average wait time
                let avgWaitTime = 0;
                if (carCount > 0) {
                    const totalWaitTime = waitingCars.reduce((sum, car) => sum + car.waitTime, 0);
                    avgWaitTime = totalWaitTime / carCount;
                }
                
                data[direction] = {
                    carCount: carCount,
                    avgWaitTime: avgWaitTime,
                    totalCars: sensor.getDetectedCarCount()
                };
            }
        });
        
        return data;
    }

    setActive(active) {
        Object.values(this.sensors).forEach(sensor => {
            sensor.active = active;
        });
    }

    draw(ctx, showSensors = true) {
        if (!showSensors) return;
        
        Object.values(this.sensors).forEach(sensor => {
            sensor.draw(ctx);
        });
        
        // Draw sensor distance indicator lines
        this.drawDistanceIndicators(ctx);
    }

    drawDistanceIndicators(ctx) {
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        
        // Draw lines from stop lines to sensor positions
        Object.values(DIRECTIONS).forEach(direction => {
            const stopLinePos = this.getStopLinePosition(direction);
            const sensorPos = this.getSensorPosition(direction);
            
            ctx.beginPath();
            ctx.moveTo(stopLinePos.x, stopLinePos.y);
            ctx.lineTo(sensorPos.x, sensorPos.y);
            ctx.stroke();
        });
        
        ctx.setLineDash([]);
    }

    getStopLinePosition(direction) {
        switch (direction) {
            case DIRECTIONS.NORTH:
                return { x: CENTER_X, y: CENTER_Y + STOP_LINE_DISTANCE };
            case DIRECTIONS.EAST:
                return { x: CENTER_X - STOP_LINE_DISTANCE, y: CENTER_Y };
            case DIRECTIONS.SOUTH:
                return { x: CENTER_X, y: CENTER_Y - STOP_LINE_DISTANCE };
            case DIRECTIONS.WEST:
                return { x: CENTER_X + STOP_LINE_DISTANCE, y: CENTER_Y };
            default:
                return { x: CENTER_X, y: CENTER_Y };
        }
    }

    getSensorPosition(direction) {
        const sensor = this.sensors[direction];
        if (!sensor) return { x: CENTER_X, y: CENTER_Y };
        
        return {
            x: sensor.x + sensor.width / 2,
            y: sensor.y + sensor.height / 2
        };
    }

    // Get statistics for display
    getStats() {
        const stats = {};
        
        Object.entries(this.sensors).forEach(([direction, sensor]) => {
            const directionName = DIRECTION_NAMES[direction];
            stats[directionName] = {
                detected: sensor.getDetectedCarCount(),
                waiting: sensor.getWaitingCars().length
            };
        });
        
        return stats;
    }

    reset() {
        Object.values(this.sensors).forEach(sensor => {
            sensor.detectedCars = [];
        });
    }
}