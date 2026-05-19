import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { candidateRouter } from './features/candidates/candidate.routes';
import { errorHandler } from './shared/middleware/errorHandler';

dotenv.config();

export const app = express();

const port = 3010;
const frontendOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000';

app.use(cors({ origin: frontendOrigin }));
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello LTI!');
});

app.use('/api/candidates', candidateRouter);

app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
