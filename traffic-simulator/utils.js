// Utility functions for the traffic simulator

// Math utilities
const Utils = {
    // Calculate distance between two points
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    // Normalize angle to 0-2π range
    normalizeAngle(angle) {
        while (angle < 0) angle += 2 * Math.PI;
        while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
        return angle;
    },

    // Convert degrees to radians
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    },

    // Convert radians to degrees
    toDegrees(radians) {
        return radians * 180 / Math.PI;
    },

    // Linear interpolation
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // Check if point is inside rectangle
    pointInRect(x, y, rectX, rectY, width, height) {
        return x >= rectX && x <= rectX + width && 
               y >= rectY && y <= rectY + height;
    },

    // Generate random color from predefined set
    randomCarColor() {
        return CAR_SETTINGS.COLORS[Math.floor(Math.random() * CAR_SETTINGS.COLORS.length)];
    },

    // Generate unique ID
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    },

    // Calculate bezier curve point
    bezierPoint(t, p0, p1, p2, p3) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        return {
            x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
            y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
        };
    },

    // Calculate turning path using bezier curves
    calculateTurnPath(fromDirection, toDirection, centerX, centerY) {
        const paths = [];
        const radius = PHYSICS.TURNING_RADIUS;
        
        // Define start and end points based on directions
        const directionOffsets = {
            [DIRECTIONS.NORTH]: { x: 0, y: STOP_LINE_DISTANCE },
            [DIRECTIONS.EAST]: { x: -STOP_LINE_DISTANCE, y: 0 },
            [DIRECTIONS.SOUTH]: { x: 0, y: -STOP_LINE_DISTANCE },
            [DIRECTIONS.WEST]: { x: STOP_LINE_DISTANCE, y: 0 }
        };

        const exitOffsets = {
            [DIRECTIONS.NORTH]: { x: 0, y: -ROAD_LENGTH },
            [DIRECTIONS.EAST]: { x: ROAD_LENGTH, y: 0 },
            [DIRECTIONS.SOUTH]: { x: 0, y: ROAD_LENGTH },
            [DIRECTIONS.WEST]: { x: -ROAD_LENGTH, y: 0 }
        };

        const startOffset = directionOffsets[fromDirection];
        const endOffset = exitOffsets[toDirection];

        const start = {
            x: centerX + startOffset.x,
            y: centerY + startOffset.y
        };

        const end = {
            x: centerX + endOffset.x,
            y: centerY + endOffset.y
        };

        // Calculate control points for smooth turning
        const controlOffset = radius * 0.6;
        let control1, control2;

        if (this.isStraight(fromDirection, toDirection)) {
            // Straight path
            control1 = { x: start.x, y: start.y - controlOffset };
            control2 = { x: end.x, y: end.y + controlOffset };
        } else if (this.isLeftTurn(fromDirection, toDirection)) {
            // Left turn
            control1 = { x: start.x - controlOffset, y: start.y - controlOffset };
            control2 = { x: end.x + controlOffset, y: end.y + controlOffset };
        } else {
            // Right turn
            control1 = { x: start.x + controlOffset, y: start.y - controlOffset };
            control2 = { x: end.x - controlOffset, y: end.y + controlOffset };
        }

        // Generate path points
        for (let t = 0; t <= 1; t += 0.05) {
            paths.push(this.bezierPoint(t, start, control1, control2, end));
        }

        return paths;
    },

    // Check if movement is straight
    isStraight(fromDirection, toDirection) {
        return (fromDirection + 2) % 4 === toDirection;
    },

    // Check if movement is left turn
    isLeftTurn(fromDirection, toDirection) {
        return (fromDirection + 3) % 4 === toDirection;
    },

    // Check if movement is right turn
    isRightTurn(fromDirection, toDirection) {
        return (fromDirection + 1) % 4 === toDirection;
    },

    // Format time in seconds to readable format
    formatTime(seconds) {
        if (seconds < 60) {
            return seconds.toFixed(1) + 's';
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}m ${remainingSeconds}s`;
        }
    },

    // Simple timer class
    Timer: class {
        constructor(duration, callback) {
            this.duration = duration;
            this.callback = callback;
            this.elapsed = 0;
            this.active = false;
        }

        start() {
            this.active = true;
            this.elapsed = 0;
        }

        stop() {
            this.active = false;
        }

        reset() {
            this.elapsed = 0;
        }

        update(deltaTime) {
            if (!this.active) return false;

            this.elapsed += deltaTime;
            if (this.elapsed >= this.duration) {
                this.active = false;
                if (this.callback) {
                    this.callback();
                }
                return true;
            }
            return false;
        }

        getProgress() {
            return this.duration > 0 ? this.elapsed / this.duration : 0;
        }

        getRemainingTime() {
            return Math.max(0, this.duration - this.elapsed);
        }
    },

    // Statistics tracking
    Stats: class {
        constructor() {
            this.totalCarsPassed = 0;
            this.totalWaitTime = 0;
            this.currentCars = 0;
            this.directionStats = {
                [DIRECTIONS.NORTH]: { passed: 0, totalWait: 0 },
                [DIRECTIONS.EAST]: { passed: 0, totalWait: 0 },
                [DIRECTIONS.SOUTH]: { passed: 0, totalWait: 0 },
                [DIRECTIONS.WEST]: { passed: 0, totalWait: 0 }
            };
        }

        addCarPassed(direction, waitTime) {
            this.totalCarsPassed++;
            this.totalWaitTime += waitTime;
            
            if (this.directionStats[direction]) {
                this.directionStats[direction].passed++;
                this.directionStats[direction].totalWait += waitTime;
            }
        }

        getAverageWaitTime() {
            return this.totalCarsPassed > 0 ? this.totalWaitTime / this.totalCarsPassed : 0;
        }

        getDirectionAverageWait(direction) {
            const stats = this.directionStats[direction];
            return stats.passed > 0 ? stats.totalWait / stats.passed : 0;
        }

        reset() {
            this.totalCarsPassed = 0;
            this.totalWaitTime = 0;
            this.currentCars = 0;
            
            Object.keys(this.directionStats).forEach(direction => {
                this.directionStats[direction] = { passed: 0, totalWait: 0 };
            });
        }
    }
};