import app from './app';

console.log('⚾ Curveball v%s', require('@curveball/core/package.json').version);

// The HTTP port can be overridden via the 'PORT' environment variable.
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8500;
app.listen(8500);

console.log('Listening on port %i', port);
