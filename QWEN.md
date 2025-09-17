# Dashboard Metrics App - Context Information

## Project Overview

This is a DHIS2 custom application called "Dashboard Usage Metrics" developed by HISP Rwanda. The application provides analytics and tracking capabilities for dashboard usage within a DHIS2 instance, helping organizations monitor and analyze how users interact with their dashboards.

### Key Features

1. **Dashboard Usage Tracking**
   - Comprehensive list of all dashboards
   - Time-based and organization unit filtering
   - Sorting by visits, last visit date, or top users
   - Drill-down to detailed access logs

2. **User Engagement Analytics**
   - User group selection
   - Access recency tracking (7 days, 30 days, etc.)
   - Login frequency analysis
   - User activity highlights

3. **District Engagement Metrics**
   - Org-unit level analysis
   - District activity tracking
   - User registration and activity metrics

4. **Inactivity Tracking**
   - Filter users by inactivity periods
   - Track never-logged-in users
   - Detailed inactivity tables

5. **Export Capabilities**
   - Excel and PDF export of reports

## Technology Stack

- **Framework**: React with TypeScript
- **UI Library**: DHIS2 UI components, Radix UI, and custom components
- **State Management**: React Query (TanStack Query) for server state, React Context for client state
- **Styling**: Tailwind CSS with custom theme configuration
- **Routing**: React Router v6
- **Build Tool**: DHIS2 App Scripts (@dhis2/cli-app-scripts)
- **Data Export**: jspdf, jspdf-autotable, xlsx

## Project Structure

```
src/
├── components/        # Reusable UI components
├── context/           # React context providers
├── data/              # Data processing utilities
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and libraries
├── pages/             # Page components for routing
├── services/          # API service definitions
├── styles/            # CSS files
├── types/             # TypeScript type definitions
├── App.tsx            # Main application component
└── index.css          # Global styles
```

## Development Environment

### Prerequisites

- Node.js 16.x or later
- Yarn 1.22.19 or later
- A running DHIS2 instance (v2.40+)

### Key Dependencies

- `@dhis2/app-runtime` - Core DHIS2 application runtime
- `@dhis2/ui` - DHIS2 UI component library
- `@tanstack/react-query` - Server state management
- `tailwindcss` - Utility-first CSS framework
- `react-router-dom` - Client-side routing

## Building and Running

### Development Server

```bash
yarn start --proxy 'https://your-dhis2-instance.org'
```

This starts the development server with proxy configuration to avoid CORS issues.

### Production Build

```bash
yarn build
```

Creates a production build in the `build` folder with a deployable `.zip` file in `build/bundle`.

### Deployment

```bash
yarn deploy
```

Deploys the built application to a DHIS2 instance. Requires DHIS2 server URL, username with app-management authority, and password.

### Other Scripts

- `yarn test` - Run tests
- `yarn build:css` - Build CSS files
- `yarn watch:css` - Watch CSS files for changes

## Development Conventions

### Code Style

- TypeScript strict mode enabled
- Tailwind CSS for styling with custom theme
- Component-based architecture with clear separation of concerns
- React functional components with hooks

### Routing

- HashRouter for client-side routing
- Nested routes with MainLayout component
- Page components organized by feature

### State Management

- React Query for server state (API calls, caching)
- React Context for client state (theme, user preferences)
- Custom hooks for reusable logic

### Styling

- Tailwind CSS with custom color palette
- shadcn/ui component library configuration
- CSS variables for theme customization
- Responsive design principles

## Key Configuration Files

- `d2.config.js` - DHIS2 app configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `webpack.config.js` - Webpack build configuration
- `postcss.config.js` - PostCSS configuration
- `components.json` - shadcn/ui component configuration

## File Path Aliases

- `@/*` maps to `src/*`

## Testing

Tests can be run with `yarn test` which uses the DHIS2 app scripts testing framework.

## Export Functionality

The application supports exporting data to:

- Excel (.xlsx) using the `xlsx` library
- PDF documents using `jspdf` and `jspdf-autotable`

## Custom UI Components

The application uses a combination of:

- DHIS2 UI components
- Radix UI primitives
- Custom components built with Tailwind CSS
- shadcn/ui components (configured for new-york style)
