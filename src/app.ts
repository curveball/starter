import { Application } from '@curveball/core';
import accessLog from '@curveball/accesslog';
import halBrowser from 'hal-browser';
import problem from '@curveball/problem';
import bodyParser from '@curveball/bodyparser';
import routes from './routes';

const app = new Application();

// The accesslog middleware shows all requests and responses on the cli.
app.use(accessLog());

app.use(halBrowser());

// The problem middleware turns exceptions into application/problem+json error
// responses.
app.use(problem());

// The bodyparser middleware is responsible for parsing JSON and url-encoded
// request bodies, and populate ctx.request.body.
app.use(bodyParser());

app.use(...routes);

export default app;
