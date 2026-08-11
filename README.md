# ScrapConnect - Frontend

ScrapConnect connects scrap sellers with buyers in their service regions, making scrap collection easier and more efficient.

## Project Description

**ScrapConnect** is a location-based scrap buyer and seller platform designed to bridge the gap between scrap sellers (households, businesses) and regional scrap buyers. This repository contains the standalone frontend single-page application built with React and Vite.

## Technology Stack

- **Framework / Build Tool:** React 19 + Vite
- **Language:** JavaScript (ES6+)
- **Styling:** CSS (Vanilla CSS with design tokens & responsive glassmorphism aesthetic)

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd scrapconnect-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Development Server

To launch the local development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

## Git Configuration & Repository Connection

To connect this repository to your GitHub account:

1. Initialize Git (if not already initialized):
   ```bash
   git init
   ```

2. Connect to your GitHub repository by replacing `<YOUR_GITHUB_USERNAME>` with your actual GitHub username:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/scrapconnect-frontend.git
   ```

3. Push to `main` branch:
   ```bash
   git branch -M main
   git push -u origin main
   ```

## Current Project Status

- **Phase:** STEP 2 — Frontend Initial Setup Complete
- **Status:** Basic clean landing page initialized.
- **Note:** Authentication, backend API integration, MongoDB, buyer/seller dashboards, chat, notifications, and listings are currently out of scope for this step and will be added in subsequent implementation steps.
