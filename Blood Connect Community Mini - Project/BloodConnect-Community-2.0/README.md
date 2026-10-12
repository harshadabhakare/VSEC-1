# BloodConnect Community — Full Stack Mini Project

A responsive, five-page community blood donor finder and blood request system.

## Technology stack
- **Frontend:** React, HTML, CSS, JavaScript, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Communication:** REST API
- **IDE:** VS Code

## Pages
1. Home
2. Find Donor (search/filter by blood group and city)
3. Emergency Request (submit a blood request)
4. Become a Donor (register donor details)
5. Community Dashboard (community statistics and requests)

## Requirements
- Node.js LTS
- MongoDB Community Server running locally, or MongoDB Atlas connection string
- VS Code

## Run in VS Code
1. Extract the ZIP and open the `BloodConnect-Community-2.0` folder in VS Code.
2. Open **Terminal → New Terminal**.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create `server/.env` from `server/.env.example`.
   - Windows PowerShell:
     ```powershell
     Copy-Item server/.env.example server/.env
     ```
   - macOS/Linux:
     ```bash
     cp server/.env.example server/.env
     ```
5. Make sure MongoDB is running. Default connection:
   `mongodb://127.0.0.1:27017/bloodconnect`
   For MongoDB Atlas, replace `MONGODB_URI` in `server/.env` with your connection string.
6. Start backend and frontend:
   ```bash
   npm start
   ```
7. Open **http://localhost:5173**.

## REST API endpoints
- `GET /api/health` — API/database status
- `GET /api/donors` — list donors; optional `?bloodGroup=O%2B&city=Nashik`
- `POST /api/donors` — register donor
- `GET /api/requests` — list blood requests
- `POST /api/requests` — create a blood request
- `PATCH /api/requests/:id/status` — set request status to `Open` or `Fulfilled`

On first start, bundled sample donors and valid sample requests are inserted into MongoDB if their collections are empty. After that, new form submissions are saved in MongoDB.

## Notes
- This is an academic/demo project, not an official medical service.
- Bundled donor entries and contact details are sample data, not verified real people.
- For a real medical emergency, contact an authorized hospital or blood bank directly.
- A production version should add authentication, consent/privacy controls, rate limiting and request moderation.
