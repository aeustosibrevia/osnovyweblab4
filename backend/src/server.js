import app from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  process.stdout.write(`Server is running on http://localhost:${env.port}\n`);
});
