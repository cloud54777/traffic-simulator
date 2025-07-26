// Configuration and constants for the 4-Way Traffic Simulator

// Canvas settings
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;

// Road and intersection settings
const ROAD_WIDTH = 80;
const LANE_WIDTH = 40;
const INTERSECTION_SIZE = 160; // Size of the central intersection area
const STOP_LINE_DISTANCE = 80; // Distance from center to stop lines
const ROAD_LENGTH = 400; // Length of each road from center

// Traffic light settings
const LIGHT_COLORS = {
    RED: '#ff4757',
    YELLOW: '#ffa502',
    GREEN: '#2ed573',
    OFF: '#8e8e8e'
};

// Default timing settings
const DEFAULT_TIMING = {
    GREEN_DURATION: 10,
    YELLOW_DURATION: 3,
    RED_DURATION: 3, // All-red phase
    CYCLE_TIME: 26 // Total cycle time
};

// Car settings
const CAR_SETTINGS = {
    WIDTH: 16,
    HEIGHT: 28,
    DEFAULT_SPEED: 25, // pixels per second
    ACCELERATION: 30,
    DECELERATION: 40,
    SPAWN_RATE: 4, // cars per 10 seconds
    TURN_RATE: 0.25, // 25% of cars turn
    COLORS: ['#3742fa', '#2f3542', '#ff4757', '#2ed573', '#ffa502', '#5f27cd']
};

// Direction constants
const DIRECTIONS = {
    NORTH: 0,
    EAST: 1,
    SOUTH: 2,
    WEST: 3
};

const DIRECTION_NAMES = ['North', 'East', 'South', 'West'];

// Turn types
const TURNS = {
    STRAIGHT: 0,
    LEFT: 1,
    RIGHT: 2
};

// Sensor settings
const SENSOR_SETTINGS = {
    DEFAULT_DISTANCE: 80,
    MIN_DISTANCE: 30,
    MAX_DISTANCE: 150,
    WIDTH: ROAD_WIDTH
};

// Game modes
const GAME_MODES = {
    FIXED: 'fixed',
    ADAPTIVE: 'adaptive'
};

// Physics constants
const PHYSICS = {
    SAFE_DISTANCE: 35, // Minimum safe following distance
    REACTION_TIME: 0.5, // Reaction time in seconds
    TURNING_RADIUS: 60 // Radius for smooth turns
};

// Adaptive mode settings
const ADAPTIVE_SETTINGS = {
    MIN_GREEN_TIME: 5, // Minimum green light duration
    MAX_GREEN_TIME: 30, // Maximum green light duration
    PRIORITY_WEIGHT_CARS: 1.0, // Weight for number of waiting cars
    PRIORITY_WEIGHT_TIME: 0.5, // Weight for waiting time
    UPDATE_INTERVAL: 1000 // How often to check priorities (ms)
};

// Visual settings
const VISUAL = {
    LANE_MARKING_WIDTH: 2,
    LANE_MARKING_COLOR: '#ffffff',
    ROAD_COLOR: '#2c2c2c',
    SIDEWALK_COLOR: '#8e8e8e',
    STOP_LINE_COLOR: '#ffffff',
    STOP_LINE_WIDTH: 4,
    DETECTION_ZONE_COLOR: 'rgba(255, 165, 0, 0.3)', // Translucent orange
    INTERSECTION_COLOR: '#2c2c2c'
};

// Export configuration object
const CONFIG = {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    CENTER_X,
    CENTER_Y,
    ROAD_WIDTH,
    LANE_WIDTH,
    INTERSECTION_SIZE,
    STOP_LINE_DISTANCE,
    ROAD_LENGTH,
    LIGHT_COLORS,
    DEFAULT_TIMING,
    CAR_SETTINGS,
    DIRECTIONS,
    DIRECTION_NAMES,
    TURNS,
    SENSOR_SETTINGS,
    GAME_MODES,
    PHYSICS,
    ADAPTIVE_SETTINGS,
    VISUAL
};