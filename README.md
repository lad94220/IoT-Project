# IoT-Project

This project is an Internet of Things (IoT) application developed for HCMUS courses. It includes source code, configuration files, and documentation to help you get started with IoT development and deployment.

## Features

- Device communication and data collection
- Backend server for data processing
- Frontend dashboard for visualization
- Configuration and deployment scripts

## Project Structure

```
/IoT-Project
├── backend/         # Server-side code (APIs, database)
├── frontend/        # Web dashboard or mobile app
├── sketch/          # Code for Arduino IDE
└── README.md
```

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [React](https://react.dev/) (for frontend)
- [Node.js](https://nodejs.org/) (for backend)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)
- [cpp](https://www.c-language.org/) (for sketch)

### Clone the Repository

```bash
git clone https://github.com/lad94220/Auto-Light.git
cd Auto-Light
```

### Setup Instructions

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```


#### Arduino

Install lib: 
+ LiquidCrystal_I2C
+ ESP8266WiFi
+ Adafruit_ADS1X15
+ PubSubClient

## FlowChart
```mermaid
flowchart TD
    Y[movement sensor] --> |send digital signal| A
    G[voltage sensor] --> |volatge value for voltage| X
    F[current sensor] --> |voltage value for current| X
    A[esp8266] --> |send current/volts/deviceIsOn| B[hivemq mqtt broker]
    A --> |send control request| P[relay]
    P --> |control| L[device]
    B --> |send control request| A
    B --> |send current/volts/deviceIsOn| C[backend]
    C --> |send control request| B
    C --> |send current/volts/deviceIsOn| D[frontend]
    D --> |send control request| C
    C --> |save current/volts/deviceIsOn/user| E[database]
    E --> |fetch data| C
    X[ads1115] --> |convert voltage value from voltage sensor and current sensor| A