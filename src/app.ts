import { Application } from '@curveball/core';
import accessLog from '@curveball/accesslog';
import problem from '@curveball/problem';
import bodyParser from '@curveball/bodyparser';
import routes from './routes';
import links from '@curveball/links';

const app = new Application();

// The accesslog middleware shows all requests and responses on the cli.
app.use(accessLog());

// The problem middleware turns exceptions into application/problem+json error
// responses.
app.use(problem());

// The bodyparser middleware is responsible for parsing JSON and url-encoded
// request bodies, and populate ctx.request.body.
app.use(bodyParser());

// The 'links' middleware automatically parses HTTP Link headers, and can also
// write them back in the response via ctx.request.links and ctx.response.links.
app.use(links());

app.use(...routes);

export default app;
