# Starting the Live Server

This document explains how to start the development server for your portfolio.

## Prerequisites

Make sure you have Node.js and npm installed on your system.

## Option 1: Start Frontend Dev Server (Recommended for Development)

This starts the Vite development server with hot module replacement (HMR).

```bash
npm run dev
```

The server will start at `http://localhost:5173` by default.

**Features:**
- Live reload on file changes
- Fast HMR (Hot Module Replacement)
- Optimized for development

## Option 2: Start Backend Server

If you need to run the Express backend server (located in the `server/` folder):

```bash
cd server
npm install  # Install dependencies first if needed
npm start    # or: node server.js
```

The backend server will start at `http://localhost:3000` by default.

## Option 3: Run Both Servers (Full Stack)

If you need both frontend and backend running simultaneously:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd server
npm start
```

## Build for Production

To create an optimized production build:

```bash
npm run build
```

The output will be in the `dist/` folder.

## Preview Production Build

To test the production build locally:

```bash
npm run preview
```

## Troubleshooting

- **Port already in use:** Change the port in `vite.config.js` for frontend or in `server/server.js` for backend
- **Dependencies missing:** Run `npm install` in the root and `cd server && npm install` for backend
- **Video not loading:** Ensure `public/alex-animation.mp4` exists in your public folder

## File Structure

```
portfolio-react/
├── public/                 # Static files (images, videos)
├── src/                    # React source files
├── server/                 # Express backend
├── package.json           # Frontend dependencies
└── vite.config.js         # Vite configuration
```
