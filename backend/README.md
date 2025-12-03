# Smart Inventory Backend

Node.js backend server with OAuth 2.0 authentication for Smart Inventory Transfer System.

## Features

- OAuth 2.0 Client Credentials Flow
- Token caching and auto-refresh
- CPI API proxy
- Mock data endpoint for testing
- CORS enabled for frontend integration

## Installation

```bash
cd backend
npm install
```

## Configuration

Edit `.env` file with your CPI credentials:

```env
CPI_BASE_URL=https://your-cpi-instance.com
CPI_CLIENT_ID=your-client-id
CPI_CLIENT_SECRET=your-client-secret
PORT=3001
```

## Running the Server

### Development mode (with auto-reload)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

Server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /health
```

### Get Stock Recommendations (Real CPI)
```
POST /api/stock-recommendations
Content-Type: application/json

{
  "Material": "10000293",
  "Plant": "1010"
}
```

### Get Mock Data (Testing)
```
POST /api/stock-recommendations/mock
Content-Type: application/json

{
  "Material": "10000293",
  "Plant": "1010"
}
```

## Authentication Flow

1. Backend automatically obtains OAuth 2.0 access token using Client Credentials
2. Token is cached and reused until expiration
3. Automatically refreshes token when needed
4. Frontend doesn't need to handle authentication

## Error Handling

- 400: Missing required parameters
- 401: Authentication failed
- 503: CPI service unavailable
- 500: Internal server error

## Testing

Use mock endpoint for testing without calling real CPI:
```bash
curl -X POST http://localhost:3001/api/stock-recommendations/mock \
  -H "Content-Type: application/json" \
  -d '{"Material":"10000293","Plant":"1010"}'
```
