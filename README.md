# SOEP

The Satellite Orbit and Event Predictor (SOEP) is a website that calculates and visualizes when satellites pass a specified geographical location, collision risks between two chosen satellites, orbital trajectories, and re-entry of satellites. It offers 3D visualizations of the earth and its active satellites in real-time.

# Installation 

## 1. Clone the repository:
   ```bash
   git clone git@github.com:SOEP-Group/SOEP-Visualizer.git
   ```

## 2. Run commands

### Option 1: Run Locally
   ```bash
   npm install
   npm run dev 
   ```

### Option 2: Run with Docker
   ```bash
   docker build -t my-node-app .
   docker run -p 3000:3000 my-node-app
   ```
   
## 3. Open a web browser and navigate to
   ```bash
   http://localhost:3000
   ```

NOTE: You need the .env file to run the application.