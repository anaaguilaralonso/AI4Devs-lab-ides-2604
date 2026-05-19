import { Router } from 'express';
import { postCandidate } from './candidate.controller';
import { uploadCv } from './candidate.upload';

export const candidateRouter = Router();

candidateRouter.post('/', uploadCv.single('cv'), postCandidate);
