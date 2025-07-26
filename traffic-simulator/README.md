# 🚦 4-Way Traffic Light Simulator

A realistic and interactive traffic simulator featuring a 4-way intersection with two operational modes: Fixed Timer and Advanced Adaptive traffic light control.

## 🚀 Features

### Core Features
- **4-Way Intersection**: Standard intersection with North, East, South, West directions
- **Realistic Road Layout**: Lane markings, stop lines, curved turning paths, sidewalks
- **Two Traffic Light Modes**:
  - **Fixed Timer Mode**: Traditional traffic lights with configurable timing
  - **Advanced Adaptive Mode**: Intelligent traffic lights that respond to traffic demand
- **Car Behavior**: Realistic acceleration, deceleration, following distance, and turning
- **Statistics Tracking**: Monitor cars passed, wait times, and traffic flow

### Visual Elements
- Clean, modern UI with intuitive controls
- Real-world-style traffic lights with glow effects
- Smooth car movement with proper physics
- Sensor detection zones (in adaptive mode)
- Live statistics and phase information

## 🎮 How to Use

### Getting Started
1. Open `index.html` in a modern web browser
2. The simulator starts automatically in Fixed Timer mode
3. Use the control panel on the right to adjust settings

### Controls

#### Game Mode
- **Fixed Timer Mode**: Traffic lights follow a predetermined cycle
- **Advanced Adaptive Mode**: Traffic lights respond to car detection

#### Traffic Light Timing (Fixed Mode)
- **Green Duration**: How long lights stay green (5-30 seconds)
- **Yellow Duration**: How long lights stay yellow (2-8 seconds)  
- **Red Duration**: All-red phase duration (2-10 seconds)

#### Car Settings
- **Cars per 10s**: Car spawn rate (1-20 cars every 10 seconds)
- **Car Speed**: Vehicle speed in pixels/second (10-50)
- **Turn Rate**: Percentage of cars that turn left/right (0-50%)

#### Sensor Settings (Adaptive Mode)
- **Detector Distance**: How far sensors are from stop lines (30-150 pixels)

#### Control Buttons
- **⏸️ Pause / ▶️ Play**: Pause or resume the simulation
- **🔄 Reset**: Reset the simulation to initial state

### Keyboard Shortcuts
- **Space**: Pause/Resume simulation
- **Ctrl+R**: Reset simulation
- **S**: Toggle sensor visibility
- **Ctrl+E**: Export simulation data

## 🧠 How It Works

### Fixed Timer Mode
- Traffic lights cycle through predetermined phases
- East-West gets green, then yellow, then all-red
- North-South gets green, then yellow, then all-red
- Cycle repeats with configurable timing

### Adaptive Mode
- Sensors detect waiting cars in each direction
- Priority calculated based on: (number of cars × 1.0) + (wait time × 0.5)
- Direction with highest priority gets green light next
- Minimum 5-second and maximum 30-second green times
- Smooth transitions through yellow and all-red phases

### Car Behavior
- Cars spawn randomly from all four directions
- 25% of cars turn (left or right), 75% go straight
- Cars follow realistic physics:
  - Gradual acceleration and deceleration
  - Safe following distances
  - Stop at red lights and for cars ahead
  - Smooth turning on curved paths

## 📊 Statistics

The simulator tracks:
- **Total Cars Passed**: Number of vehicles that completed their journey
- **Average Wait Time**: Mean time cars spend waiting at red lights
- **Current Cars**: Number of vehicles currently in the simulation

## 🛠️ Technical Details

### File Structure
```
traffic-simulator/
├── index.html          # Main HTML file with UI
├── styles.css          # Modern CSS styling
├── config.js           # Configuration and constants
├── utils.js            # Utility functions and math helpers
├── cars.js             # Car class and movement logic
├── trafficLights.js    # Traffic light system
├── intersection.js     # Road layout and intersection drawing
├── sensors.js          # Detection system for adaptive mode
├── controllers.js      # Traffic light control logic
├── ui.js               # User interface handling
└── main.js             # Game initialization and main loop
```

### Technologies Used
- **HTML5 Canvas** for graphics rendering
- **Vanilla JavaScript** for all game logic
- **CSS3** for modern UI styling
- **RequestAnimationFrame** for smooth 60 FPS animation

### Performance
- Optimized rendering pipeline
- Efficient collision detection
- Smooth animations at 60 FPS
- Responsive design for different screen sizes

## 🎯 Educational Value

This simulator is perfect for:
- Understanding traffic flow dynamics
- Learning about adaptive traffic control systems
- Studying the impact of different timing strategies
- Visualizing intersection capacity and efficiency
- Traffic engineering education and research

## 🔧 Customization

The simulator is designed to be easily expandable:
- Add pedestrian crossings
- Implement emergency vehicle priority
- Create multi-intersection networks
- Add different vehicle types (trucks, buses)
- Integrate with real traffic data

## 🐛 Troubleshooting

If you encounter issues:
1. Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
2. Check the browser console for error messages
3. Ensure JavaScript is enabled
4. Try refreshing the page

## 📈 Future Enhancements

Potential improvements:
- Pedestrian simulation
- Emergency vehicle priority
- Weather effects on traffic
- Multiple intersection networks
- Real-time traffic data integration
- Machine learning optimization

---

Enjoy exploring traffic dynamics with this interactive simulator! 🚗💨