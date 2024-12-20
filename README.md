# Crypto Viewer

## Description
Crypto Viewer is a web application designed for tracking cryptocurrency prices across various exchanges in real-time. It provides users with tools for monitoring favorite coins, adding custom trading pairs, and comparing exchange data.

## Features
- Registration and Authentication: Secure sign-up and login for personalized user experience.
- Real-Time Price Updates: Monitor live cryptocurrency prices using WebSocket integration.
- Custom Coins: Add, edit, or delete custom trading pairs.
- Favorites: Mark and organize favorite coins for easy tracking.
- Market Comparison: View and compare data from multiple exchanges.
- Responsive Design: Optimized for desktop devices.

## Installation

### Prerequisites
- Docker and Docker Compose installed
- Access to a PostgreSQL database
- Python 3.10+ and Node.js (if running locally)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/slavikDe/crypto_viewer.git
2. Navigate to the project directory:
   ```bash
   cd crypto_viewer
3. Build and run the application using Docker:
   ```bash
   docker-compose up --build

### Usage   
1. Open your web browser and navigate to:
   ```bash
   http://localhost:8000

2. Register or log in to access personalized features.
3. Use the search functionality to find specific coins or trading pairs.
4. Add or manage your favorite and custom coins.
