'use strict';

module.exports = (options, app) => {
    return async function errorHandler(ctx, next) {
        try {
            await next();
        } catch (err) {
            const config = app.config.errorHandler2;
            const message = err.message || err;
            if (!config.protection) {
                ctx.failed(message);
            } else {
                if (app.config.env !== 'prod') {
                    ctx.failed(message);
                    return;
                }
                if (typeof err === 'string') {
                    ctx.failed(message);
                    return;
                }
                for (const item of config.ignore) {
                    if (err instanceof item) {
                        ctx.failed(err.name + ':' + message);
                        return;
                    }
                }
                if (!config.tips) {
                    ctx.failed('Internal Server Error');
                } else {
                    ctx.failed(config.tips);
                }
                app.emit('error', err, ctx);
            }
        }
    };
};