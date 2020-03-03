import { Application } from '@curveball/core';
import accessLog from '@curveball/accesslog';
import problem from '@curveball/problem';
import bodyParser from '@curveball/bodyparser';

console.log('⚾ Curveball v%s', require('@curveball/core/package.json').version);

const app = new Application();

// The accesslog middleware shows all requests and responses on the cli.
app.use(accessLog());

// The problem middleware turns exceptions into application/problem+json error
// responses.
app.use(problem());

// The bodyparser middleware is responsible for parsing JSON and url-encoded
// request bodies, and populate ctx.request.body.
app.use(bodyParser());

// The HTTP port can be overridden via the 'PORT' environment variable.
const port = process.env.PORT ? parseInt(process.env.PORT, 12) : 8500;
app.listen(8500);

console.log('Listening on port %i', port);
