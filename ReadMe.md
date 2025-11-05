# Currency Dashboard

A full-stack currency exchange rate dashboard built with React, and Flask. Features real-time exchange rate tracking, interactive charts, data grids and data persistance on refresh.


## Features

### Frontend (React)
- **Interactive Charts** - Multi-line time series visualization with Chart.js
- **Advanced Data Grid** - AG Grid with filtering, sorting, and local storage persistence
- **Responsive Design** - Mobile-first design with Tailwind CSS

### Backend (Flask + Python)
- **RESTful API** - Clean API design with 1 main endpoint
- **Frankfurter Integration** - Live exchange rate data from ECB
- **Historical Data** - Support for 2-year historical ranges
- **Validation** - Comprehensive input validation and error handling


##  Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/venuraperera99/henon-dashboard.git
cd henon-dashboard
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Linux distro
pip install -r requirements.txt
python3 app.py
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4. Open Browser
Navigate to `http://localhost:5173` to use the currency dashboard application!



## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/rates/multiple` | POST | Batch retrieval for multiple currency pairs |


## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite 5** - Build tool
- **Tailwind CSS 3** - Styling
- **Chart.js 4** - Charts
- **AG Grid 32** - Data tables
- **Axios** - HTTP client

### Backend
- **Flask 3** - Web framework
- **Requests** - HTTP library



## Project Structure

```
henon-dashboard/
├── backend/                 # Flask API
│   ├── app.py              # Main application
│   └── requirements.txt    # Dependencies
├── frontend/               # React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utilities
│   ├── package.json
│   └── vite.config.ts
└── README.md
```
