const config = {
    type: 'app',
    name: 'Dashboard Usage Metrics',
    title: 'Dashboard Usage Metrics',
    description: 'The Dashboard Usage Metrics app provides analytics and tracking capabilities for dashboard usage within a DHIS2 instance. This tool helps organizations monitor and analyze how users interact with their dashboards, enabling better understanding of dashboard utilization patterns.',
    minDHIS2Version: '2.39',
    entryPoints: {
        app: './src/App.tsx',
    },
};

module.exports = config;
