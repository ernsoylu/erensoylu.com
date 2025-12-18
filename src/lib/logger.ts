export const logger = {
    isEnabled: import.meta.env.VITE_DEBUG === 'true',

    log: (type: 'VIEW' | 'ACTION' | 'API' | 'ERROR', component: string, action: string, details?: Record<string, unknown> | unknown) => {
        if (import.meta.env.VITE_DEBUG !== 'true') return;


        const style = {
            VIEW: 'background: #2196F3; color: white; padding: 2px 5px; border-radius: 2px;',
            ACTION: 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 2px;',
            API: 'background: #FF9800; color: white; padding: 2px 5px; border-radius: 2px;',
            ERROR: 'background: #F44336; color: white; padding: 2px 5px; border-radius: 2px;',
        };



        console.log(
            `%c${type}%c [${component}] ${action}`,
            style[type],
            'color: inherit; font-weight: bold;',
            details || ''
        );

        // Optional: Persist or send logs if needed in future
    },

    view: (component: string, details?: Record<string, unknown>) => logger.log('VIEW', component, 'Mounted/Visited', details),
    action: (component: string, action: string, details?: Record<string, unknown>) => logger.log('ACTION', component, action, details),
    api: (component: string, action: string, details?: Record<string, unknown>) => logger.log('API', component, action, details),
    error: (component: string, action: string, error: unknown) => {
        logger.log('ERROR', component, action, error);
        console.error(error); // Ensure stack trace is visible
    }
};
