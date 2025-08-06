# DNSBunch Development Setup

This guide will help you set up the DNSBunch project for local development.

## Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- macOS/Linux: `source venv/bin/activate`

4. Install Python dependencies:
```bash
pip install -r requirements.txt
```

5. Copy environment file and configure:
```bash
cp .env.example .env
```

6. Run the backend server:
```bash
python app.py
```

The backend will be available at `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Copy environment file and configure:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## API Documentation

### Health Check
- **GET** `/` - Check if the API is running

### DNS Analysis
- **POST** `/api/check` - Perform DNS analysis
  
Request body:
```json
{
  "domain": "example.com",
  "checks": ["all"] // or specific checks like ["ns", "mx", "spf"]
}
```

## Development Tips

1. The backend has CORS enabled for development
2. Hot reload is enabled for both frontend and backend
3. Check the browser console for API request/response logs
4. DNS checks can take 30-60 seconds depending on the domain

## Troubleshooting

### Backend Issues
- Make sure Python virtual environment is activated
- Check if all Python packages are installed correctly
- Verify DNS resolver is working (some corporate networks block DNS queries)

### Frontend Issues
- Clear browser cache and reload
- Check if backend is running on port 5000
- Verify API URL in frontend .env file

### DNS Check Issues
- Some domains may have security measures that block certain DNS queries
- Timeout errors are normal for slow-responding nameservers
- Check firewall settings if getting connection errors
