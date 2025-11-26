# Automation Analytics Dashboard

## Overview
The **Automation Analytics Dashboard** is a React-based web application designed to visualize and analyze automation metrics. It allows users to upload data (likely from Excel/CSV), view high-level KPIs, and explore detailed breakdowns of cost and time savings.

## Key Features

### 1. Data Ingestion
- **File Upload**: Users can upload data files (Excel/CSV) to populate the dashboard.
- **Data Parsing**: The application parses headers and rows to structure the data for analysis.

### 2. Executive Dashboard
The core component (`ExecutiveDashboard.tsx`) provides a comprehensive view of automation performance:
- **KPI Cards**: Displays key metrics:
  - **Total Cost Savings**: Financial impact of automations.
  - **Total Time Savings**: Productivity gains in hours/years.
  - **Active Automations**: Count of deployed use cases.
  - **ROI Analysis**: Average return on investment per automation.
- **View Modes**:
  - **Forecast**: Projected annual savings.
  - **Period Tracking**: Actual realized savings based on reporting periods.
  - **Forecast vs Actual**: Comparison view to track performance against goals.

### 3. Visualizations
- **Bar Charts**:
  - Cost Savings by Use Case.
  - Time Savings by Use Case.
  - ROI Analysis (Cost savings per hour saved).
  - Comparison charts for Forecast vs Actuals.
- **Pie Chart**: Cost Savings Distribution (grouped by Team/Area if available).
- **Interactive Elements**: Tooltips, legends, and responsive containers.

### 4. Data Analysis & Filtering
- **Data Slicer**: Allows users to filter the dataset by:
  - Specific columns and values.
  - Date ranges (optional).
- **Drill-down**: Users can select specific use cases to filter the charts.
- **Period Trends**: Calculates period-over-period trends for cost and time savings.

### 5. Export Capabilities
- **Excel Export**: Download the current dataset as an Excel file.
- **Image Export**: Save individual charts or the entire dashboard view as PNG images for reporting.

### 6. Responsive UI
- **Collapsible Sections**: Data and Control sections can be collapsed to maximize screen real estate for the dashboard.
- **Theme**: Uses a modern, clean design with gradient headers and card-based layouts.


## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3a5d3327-375f-4d61-8616-70410e2f8955) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Tech Stack
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn-ui
- **Charts**: Recharts
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Utilities**: `xlsx` (Excel processing), `html2canvas` (Image export), `zod` (Validation)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3a5d3327-375f-4d61-8616-70410e2f8955) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
