import { Request, Response, NextFunction } from 'express';
import {
  createCandidateSchema,
  formatZodErrors,
} from './candidate.validator';
import { createCandidate, DuplicateEmailError } from './candidate.service';

export async function postCandidate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = createCandidateSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: 'Invalid data',
        errors: formatZodErrors(parsed.error),
      });
      return;
    }

    const candidate = await createCandidate({
      data: parsed.data,
      file: req.file,
    });

    res.status(201).json({
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      message: 'Candidate added successfully',
    });
  } catch (error) {
    const isDuplicate =
      error instanceof DuplicateEmailError ||
      (error instanceof Error && error.name === 'DuplicateEmailError');

    if (isDuplicate) {
      res.status(409).json({
        message: 'A candidate with this email already exists',
      });
      return;
    }
    next(error);
  }
}
