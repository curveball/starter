/* eslint no-console:0 "@typescript-eslint/no-var-requires": 0 */
import app from './app';

console.log('⚾ Curveball v%s', require('@curveball/core/package.json').version);

// The HTTP port can be overridden via the 'PORT' environment variable.
if (!process.env.PORT) process.env.PORT = '8500';
app.listen(+process.env.PORT!);

console.log('Running on \x1b[31m%s\x1b[0m', app.origin + '/');
