# Dashboard Metrics App

### Contents

- [Introduction](#introduction)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building](#building)
- [Deployment](#deployment)

## Introduction

The Dashboard Metrics App is a DHIS2 custom application developed by HISP Rwanda that provides analytics and tracking capabilities for dashboard usage within a DHIS2 instance. This tool helps organizations monitor and analyze how users interact with their dashboards, enabling better understanding of dashboard utilization patterns.

## Features

- **Dashboard Overview**: View comprehensive list of available dashboards
- **Usage Analytics**: Track and analyze dashboard access patterns
- **Advanced Filtering**:
  - Time-based filtering of access data
  - Organization unit-based filtering
- **Export Capabilities**:
  - Export analytics as Excel files
  - Export analytics as PDF documents

## Prerequisites

This project requires:

- Node.js 16.x or later
- Yarn 1.22.19 or later
- DHIS2 instance

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/hisprwanda/dashboard-metrics
cd dashboard-metrics
yarn install
```

## Development

To start the development server:

```bash
yarn start --proxy 'https://your-dhis2-instance.org'
```

When the application starts, you will be prompted to enter:

- Username
- Password

The application will be available at http://localhost:3000

Note: Using the proxy flag helps avoid CORS issues during development. Replace 'https://your-dhis2-instance.org' with your actual DHIS2 instance URL.

## Building

Create a production build:

```bash
yarn build
```

The build files will be available in the `build` folder, with a deployable `.zip` file in `build/bundle`.

## Deployment

Deploy the built application to a DHIS2 instance:

```bash
yarn deploy
```

You will need to provide:

- DHIS2 server URL
- Username with app management authority
- Password

Note: Run `yarn build` before deploying.
