export const logger = {
    isEnabled: import.meta.env.VITE_DEBUG === 'true',

    log: (type: 'VIEW' | 'ACTION' | 'API' | 'ERROR', component: string, action: string, details?: any) => {
        if (import.meta.env.VITE_DEBUG !== 'true') return;

        const timestamp = new Date().toISOString();
        const style = {
            VIEW: 'background: #2196F3; color: white; padding: 2px 5px; border-radius: 2px;',
            ACTION: 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 2px;',
            API: 'background: #FF9800; color: white; padding: 2px 5px; border-radius: 2px;',
            ERROR: 'background: #F44336; color: white; padding: 2px 5px; border-radius: 2px;',
        };

        const logEntry = {
            timestamp,
            type,
            component,
            action,
            details,
        };

        console.log(
            `%c${type}%c [${component}] ${action}`,
            style[type],
            'color: inherit; font-weight: bold;',
            details || ''
        );

        // Optional: Persist or send logs if needed in future
    },

    view: (component: string, details?: any) => logger.log('VIEW', component, 'Mounted/Visited', details),
    action: (component: string, action: string, details?: any) => logger.log('ACTION', component, action, details),
    api: (component: string, action: string, details?: any) => logger.log('API', component, action, details),
    error: (component: string, action: string, error: any) => {
        logger.log('ERROR', component, action, error);
        console.error(error); // Ensure stack trace is visible
    }
};
