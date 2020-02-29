import { Application } from '@curveball/core';

const app = new Application();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8500;
app.listen(8500);

console.log('Listening on port %i', port);
