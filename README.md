#  Karthik's Pit Wall — Mercedes-AMG F1 Dashboard

A premium, highly interactive F1 Dashboard built for the current Formula 1 season. Fully themed with the iconic Mercedes-AMG Petronas styling, featuring live telemetry indicators, constructor progress trackers, championship simulators, and hidden team secrets.

---

## Features

### 1. Race Control & Standing Center
* **Real-time Standings**: Comprehensive driver and constructor rankings fetched live from Jolpica/Ergast API, complete with custom team branding and 3D hover effects.
* **Constructor Progression**: Dynamic visual representation of team points tracking across the current season.
* **Next Race Countdown**: Precise lights-out tracker with automated session state transition mechanics.

### 2.  The Strategy Room
* **Champion Predictor**: Simulate mathematical probabilities and point distribution to predict the driver's championship resolution.
* **Teammate Battles**: Head-to-head performance grids showcasing qualifying and race differentials between teammates.
* **Tyre Strategy & Degradation Simulator**: Interactive tool to model tyre compounds (Soft, Medium, Hard) and trace lap-time drop-off.
* **Overtaking & Specialization Indices**: Dynamic metrics displaying driver overtake statistics and track-type specializations (Street circuits vs. High-speed temples).

### 3. Classified Archives (Easter Egg Hunt)
For those willing to search deeper, the Pit Wall contains a classified terminal easter egg:
1. Scroll down to the page footer and locate the dim `🔒 Classified` lock badge.
2. Click it to initiate a **Level 1 Encryption Decryption Riddle** related to the Scuderia vs. Silver Arrows rivalry.
3. Answer the riddle correctly to gain clearance.
4. Once cleared, click the new glowing elements to unlock the **Classified Records** terminal featuring custom greetings from the team drivers.

---

##  Tech Stack

* **Framework**: React 18, TypeScript, Vite
* **Routing**: `wouter` (lightweight routing)
* **Data Fetching & Caching**: TanStack Query (`@tanstack/react-query`)
* **Styling**: Modern CSS Tokens with CSS Variables (Light/Dark mode responsive)
* **Hosting & Analytics**: Vercel & Vercel Web Analytics
* **Code Quality**: SonarCloud CI Pipeline integrations

---

##  Getting Started

### Prerequisites
Make sure you have **Node.js (v18+)** and **npm** installed on your system.

### Local Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Karthik99880/Karthik-s-Pit-Wall.git
   cd Karthik-s-Pit-Wall
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Launch the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the local URL (usually `http://localhost:5173`).

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## License

This project is open-source and built for F1 fans and developers. Enjoy the race weekend!
