# SOEP (Satellite Orbit and Event Predictor)

Check out the live version of SOEP here: [soep.tech](https://www.soep.tech)

## Table of Contents

- [SOEP (Satellite Orbit and Event Predictor)](#soep-satellite-orbit-and-event-predictor)
  - [Table of Contents](#table-of-contents)
  - [About the Project](#about-the-project)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation \& Running Locally](#installation--running-locally)
    - [Docker Option](#docker-option)
  - [Contributing](#contributing)
  - [License](#license)
  - [Donations](#donations)
  - [Get in Touch](#get-in-touch)

## About the Project

SOEP (Satellite Orbit and Event Predictor) is a platform for satellite tracking, visualization, and event prediction. It provides:

- Real-time 3D Earth-based satellite tracking.
- Detailed satellite data (orbital parameters, launch info, ownership).
- Celestial event predictions (sun/moon rise/set, planetary events).
- Satellite pass predictions and collision risk analysis.
- Interactive charts for speed, altitude, longitude, and latitude projections.

Whether you are a space enthusiast, amateur astronomer, or just curious about the cosmos, SOEP offers an engaging way to explore near-Earth objects and planetary events.

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher recommended)
- **npm** (v6 or higher recommended)
- **Docker** (optional, if you plan to use the containerized approach)

### Installation & Running Locally

1. **Clone the repository** or download the source code.
2. **Navigate** to the project folder.
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run the project in development mode**:
   ```bash
   npm run dev
   ```
5. Open your browser and visit `http://localhost:3000` (or the port displayed in your console) to access SOEP.

> **Note:** You will need a valid `.env` file to run the project in full. Please [get in touch](#get-in-touch) with us to obtain the necessary environment variables.

### Docker Option

1. **Build the Docker image**:
   ```bash
   docker build -t soep .
   ```
2. **Run the Docker container** (persist the sqlite database locally):
   ```bash
   docker run -d \
     --name soep \
     -p 3000:3000 \
     -v "$(pwd)/data:/server/data" \
     soep
   ```
3. **Seed the database (first run only)**:
   ```bash
   docker exec soep node scripts/updateSatellites.js
   ```
   The entrypoint runs this on startup, but you can rerun it manually any time.
4. Tail logs to confirm the initial sync:
   ```bash
   docker logs -f soep
   ```
5. Access the application at `http://localhost:3000` in your browser.

> **Note:** Even with Docker, you still require a valid `.env` file. Please [contact us](#get-in-touch) for details on obtaining it.

## Contributing

We’re excited to open this project to the community! Contributions are welcome—whether it's fixing bugs, adding features, or improving the design.

Here’s how you can help:

1. **Fork the Repository** on GitHub.
2. **Create a New Branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "Add new feature"
   ```
4. **Push to your branch**:
   ```bash
   git push origin feature/new-feature
   ```
5. **Open a Pull Request** and provide a detailed description of your changes.

## License

```
MIT License

Copyright (c) 2024 SOEP-Group

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Donations

If you find this project useful and would like to support its development, you can buy us a coffee here:  
[**https://buymeacoffee.com/soep_tech**](https://buymeacoffee.com/soep_tech)

Any contribution goes a long way in helping us maintain and enhance SOEP for the community!

## Get in Touch

- **Email:** [soep.helper@gmail.com](mailto:soep.helper@gmail.com)
- **Discord Community:** [https://discord.gg/KugYbYKX2k](https://discord.gg/KugYbYKX2k)

Feel free to reach out if you have any questions, need the `.env` file, or just want to say hi!
