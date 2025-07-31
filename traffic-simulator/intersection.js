// Intersection layout and road drawing for the 4-way traffic simulator

class Intersection {
    constructor() {
        this.centerX = CENTER_X;
        this.centerY = CENTER_Y;
        this.roadWidth = ROAD_WIDTH;
        this.laneWidth = LANE_WIDTH;
        this.intersectionSize = INTERSECTION_SIZE;
        this.stopLineDistance = STOP_LINE_DISTANCE;
    }

    draw(ctx) {
        // Clear the canvas with background
        ctx.fillStyle = VISUAL.SIDEWALK_COLOR;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw roads
        this.drawRoads(ctx);
        
        // Draw intersection
        this.drawCentralIntersection(ctx);
        
        // Draw lane markings
        this.drawLaneMarkings(ctx);
        
        // Draw stop lines
        this.drawStopLines(ctx);
        
        // Draw turning guide lines
        this.drawTurningGuides(ctx);
        
        // Draw sidewalks and curbs
        this.drawSidewalks(ctx);
    }

    drawRoads(ctx) {
        ctx.fillStyle = VISUAL.ROAD_COLOR;
        
        // North-South road
        ctx.fillRect(
            this.centerX - this.roadWidth / 2,
            0,
            this.roadWidth,
            CANVAS_HEIGHT
        );
        
        // East-West road
        ctx.fillRect(
            0,
            this.centerY - this.roadWidth / 2,
            CANVAS_WIDTH,
            this.roadWidth
        );
    }

    drawCentralIntersection(ctx) {
        ctx.fillStyle = VISUAL.INTERSECTION_COLOR;
        ctx.fillRect(
            this.centerX - this.intersectionSize / 2,
            this.centerY - this.intersectionSize / 2,
            this.intersectionSize,
            this.intersectionSize
        );
    }

    drawLaneMarkings(ctx) {
        ctx.strokeStyle = VISUAL.LANE_MARKING_COLOR;
        ctx.lineWidth = VISUAL.LANE_MARKING_WIDTH;
        ctx.setLineDash([10, 10]); // Dashed line pattern
        
        // North-South lane divider (except through intersection)
        ctx.beginPath();
        // Top section
        ctx.moveTo(this.centerX, 0);
        ctx.lineTo(this.centerX, this.centerY - this.intersectionSize / 2);
        // Bottom section
        ctx.moveTo(this.centerX, this.centerY + this.intersectionSize / 2);
        ctx.lineTo(this.centerX, CANVAS_HEIGHT);
        ctx.stroke();
        
        // East-West lane divider (except through intersection)
        ctx.beginPath();
        // Left section
        ctx.moveTo(0, this.centerY);
        ctx.lineTo(this.centerX - this.intersectionSize / 2, this.centerY);
        // Right section
        ctx.moveTo(this.centerX + this.intersectionSize / 2, this.centerY);
        ctx.lineTo(CANVAS_WIDTH, this.centerY);
        ctx.stroke();
        
        // Reset line dash
        ctx.setLineDash([]);
        
        // Draw solid edge lines
        ctx.strokeStyle = VISUAL.LANE_MARKING_COLOR;
        ctx.lineWidth = 2;
        
        // North-South road edges
        this.drawSolidLine(ctx, 
            this.centerX - this.roadWidth / 2, 0,
            this.centerX - this.roadWidth / 2, this.centerY - this.intersectionSize / 2
        );
        this.drawSolidLine(ctx,
            this.centerX + this.roadWidth / 2, 0,
            this.centerX + this.roadWidth / 2, this.centerY - this.intersectionSize / 2
        );
        this.drawSolidLine(ctx,
            this.centerX - this.roadWidth / 2, this.centerY + this.intersectionSize / 2,
            this.centerX - this.roadWidth / 2, CANVAS_HEIGHT
        );
        this.drawSolidLine(ctx,
            this.centerX + this.roadWidth / 2, this.centerY + this.intersectionSize / 2,
            this.centerX + this.roadWidth / 2, CANVAS_HEIGHT
        );
        
        // East-West road edges
        this.drawSolidLine(ctx,
            0, this.centerY - this.roadWidth / 2,
            this.centerX - this.intersectionSize / 2, this.centerY - this.roadWidth / 2
        );
        this.drawSolidLine(ctx,
            0, this.centerY + this.roadWidth / 2,
            this.centerX - this.intersectionSize / 2, this.centerY + this.roadWidth / 2
        );
        this.drawSolidLine(ctx,
            this.centerX + this.intersectionSize / 2, this.centerY - this.roadWidth / 2,
            CANVAS_WIDTH, this.centerY - this.roadWidth / 2
        );
        this.drawSolidLine(ctx,
            this.centerX + this.intersectionSize / 2, this.centerY + this.roadWidth / 2,
            CANVAS_WIDTH, this.centerY + this.roadWidth / 2
        );
    }

    drawSolidLine(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    drawStopLines(ctx) {
        ctx.strokeStyle = VISUAL.STOP_LINE_COLOR;
        ctx.lineWidth = VISUAL.STOP_LINE_WIDTH;
        
        // North stop line
        this.drawSolidLine(ctx,
            this.centerX - this.laneWidth / 2,
            this.centerY + this.stopLineDistance,
            this.centerX + this.laneWidth / 2,
            this.centerY + this.stopLineDistance
        );
        
        // East stop line
        this.drawSolidLine(ctx,
            this.centerX - this.stopLineDistance,
            this.centerY - this.laneWidth / 2,
            this.centerX - this.stopLineDistance,
            this.centerY + this.laneWidth / 2
        );
        
        // South stop line
        this.drawSolidLine(ctx,
            this.centerX - this.laneWidth / 2,
            this.centerY - this.stopLineDistance,
            this.centerX + this.laneWidth / 2,
            this.centerY - this.stopLineDistance
        );
        
        // West stop line
        this.drawSolidLine(ctx,
            this.centerX + this.stopLineDistance,
            this.centerY - this.laneWidth / 2,
            this.centerX + this.stopLineDistance,
            this.centerY + this.laneWidth / 2
        );
    }

    drawTurningGuides(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 15]);
        
        // Draw curved paths for left and right turns
        this.drawTurningPath(ctx, DIRECTIONS.NORTH, DIRECTIONS.EAST); // North to East (right turn)
        this.drawTurningPath(ctx, DIRECTIONS.NORTH, DIRECTIONS.WEST); // North to West (left turn)
        this.drawTurningPath(ctx, DIRECTIONS.EAST, DIRECTIONS.SOUTH); // East to South (right turn)
        this.drawTurningPath(ctx, DIRECTIONS.EAST, DIRECTIONS.NORTH); // East to North (left turn)
        this.drawTurningPath(ctx, DIRECTIONS.SOUTH, DIRECTIONS.WEST); // South to West (right turn)
        this.drawTurningPath(ctx, DIRECTIONS.SOUTH, DIRECTIONS.EAST); // South to East (left turn)
        this.drawTurningPath(ctx, DIRECTIONS.WEST, DIRECTIONS.NORTH); // West to North (right turn)
        this.drawTurningPath(ctx, DIRECTIONS.WEST, DIRECTIONS.SOUTH); // West to South (left turn)
        
        ctx.setLineDash([]);
    }

    drawTurningPath(ctx, fromDirection, toDirection) {
        // Calculate turn path using bezier curves
        const turnPath = Utils.calculateTurnPath(fromDirection, toDirection, this.centerX, this.centerY);
        
        if (turnPath.length > 1) {
            ctx.beginPath();
            ctx.moveTo(turnPath[0].x, turnPath[0].y);
            
            for (let i = 1; i < turnPath.length; i++) {
                ctx.lineTo(turnPath[i].x, turnPath[i].y);
            }
            
            ctx.stroke();
        }
    }

    drawSidewalks(ctx) {
        const sidewalkWidth = 20;
        ctx.fillStyle = VISUAL.SIDEWALK_COLOR;
        
        // Corner sidewalks (squares in each corner)
        const cornerSize = this.intersectionSize / 2 + sidewalkWidth;
        
        // Top-left corner
        ctx.fillRect(
            this.centerX - cornerSize,
            this.centerY - cornerSize,
            cornerSize - this.roadWidth / 2,
            cornerSize - this.roadWidth / 2
        );
        
        // Top-right corner
        ctx.fillRect(
            this.centerX + this.roadWidth / 2,
            this.centerY - cornerSize,
            cornerSize - this.roadWidth / 2,
            cornerSize - this.roadWidth / 2
        );
        
        // Bottom-left corner
        ctx.fillRect(
            this.centerX - cornerSize,
            this.centerY + this.roadWidth / 2,
            cornerSize - this.roadWidth / 2,
            cornerSize - this.roadWidth / 2
        );
        
        // Bottom-right corner
        ctx.fillRect(
            this.centerX + this.roadWidth / 2,
            this.centerY + this.roadWidth / 2,
            cornerSize - this.roadWidth / 2,
            cornerSize - this.roadWidth / 2
        );
        
        // Draw curb details
        this.drawCurbs(ctx);
    }

    drawCurbs(ctx) {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        
        const curbOffset = 2;
        
        // North-South road curbs
        this.drawSolidLine(ctx,
            this.centerX - this.roadWidth / 2 - curbOffset, 0,
            this.centerX - this.roadWidth / 2 - curbOffset, CANVAS_HEIGHT
        );
        this.drawSolidLine(ctx,
            this.centerX + this.roadWidth / 2 + curbOffset, 0,
            this.centerX + this.roadWidth / 2 + curbOffset, CANVAS_HEIGHT
        );
        
        // East-West road curbs
        this.drawSolidLine(ctx,
            0, this.centerY - this.roadWidth / 2 - curbOffset,
            CANVAS_WIDTH, this.centerY - this.roadWidth / 2 - curbOffset
        );
        this.drawSolidLine(ctx,
            0, this.centerY + this.roadWidth / 2 + curbOffset,
            CANVAS_WIDTH, this.centerY + this.roadWidth / 2 + curbOffset
        );
    }

    // Helper method to check if a point is within the intersection
    isPointInIntersection(x, y) {
        return x >= this.centerX - this.intersectionSize / 2 &&
               x <= this.centerX + this.intersectionSize / 2 &&
               y >= this.centerY - this.intersectionSize / 2 &&
               y <= this.centerY + this.intersectionSize / 2;
    }

    // Get the lane center position for a given direction
    getLaneCenter(direction) {
        switch (direction) {
            case DIRECTIONS.NORTH:
                return {
                    x: this.centerX - this.laneWidth / 2,
                    y: this.centerY + ROAD_LENGTH
                };
            case DIRECTIONS.EAST:
                return {
                    x: this.centerX - ROAD_LENGTH,
                    y: this.centerY - this.laneWidth / 2
                };
            case DIRECTIONS.SOUTH:
                return {
                    x: this.centerX + this.laneWidth / 2,
                    y: this.centerY - ROAD_LENGTH
                };
            case DIRECTIONS.WEST:
                return {
                    x: this.centerX + ROAD_LENGTH,
                    y: this.centerY + this.laneWidth / 2
                };
            default:
                return { x: this.centerX, y: this.centerY };
        }
    }

    // Get stop line position for a given direction
    getStopLinePosition(direction) {
        switch (direction) {
            case DIRECTIONS.NORTH:
                return {
                    x: this.centerX,
                    y: this.centerY + this.stopLineDistance
                };
            case DIRECTIONS.EAST:
                return {
                    x: this.centerX - this.stopLineDistance,
                    y: this.centerY
                };
            case DIRECTIONS.SOUTH:
                return {
                    x: this.centerX,
                    y: this.centerY - this.stopLineDistance
                };
            case DIRECTIONS.WEST:
                return {
                    x: this.centerX + this.stopLineDistance,
                    y: this.centerY
                };
            default:
                return { x: this.centerX, y: this.centerY };
        }
    }
}