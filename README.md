# RailTech - Intelligent Railway Operations & Maintenance Planning

RailTech is an intelligent railway operations and maintenance decision-support platform designed to optimize maintenance block scheduling and resolve operational conflicts across Engineering (Track), Signal & Telecom (S&T), and Traction departments. 

## Features

- **Role-Based Portals**: Separate, secure dashboards tailored for Control Office, Engineering / Track, Signal & Telecom (S&T), and Traction departments.
- **AI Prioritization**: Automated priority scoring for maintenance requests based on Criticality, Urgency, Safety Risk, and Asset Condition.
- **Resource Readiness Verification**: Pre-execution verification of line clearance, machinery, and gang crew availability before any maintenance block starts.
- **Control Office Command Hub**: Comprehensive overview of live train movements, pending maintenance requests, and AI-optimized possession block opportunities.
- **Indian Railways Visual Identity**: A professional, high-contrast UI mirroring the robust standards of Indian Railways with deep navys, crisp whites, and distinct safety alert colors.

## Tech Stack

- **Frontend**: React, Vite, Vanilla CSS (Tailwind used sparingly for utility where applicable)
- **State Management**: React Context API
- **Routing**: Client-side standard routing
- **Data Persistence**: LocalStorage (Demo mode)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/beingmaroof/RailTech.git
   cd RailTech
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Deployment
This project is configured to be easily deployable to Vercel. 
1. Import the repository into Vercel.
2. The default build settings for Vite will be automatically detected (`npm run build`, output directory `dist`).

## License
MIT License
