import fs from 'fs';
import path from 'path';
import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/prisma';
import { CreateCandidateInput } from './candidate.validator';

export class DuplicateEmailError extends Error {
  constructor() {
    super('Duplicate email');
    this.name = 'DuplicateEmailError';
  }
}

interface CreateCandidateParams {
  data: CreateCandidateInput;
  file?: Express.Multer.File;
}

function removeFileIfExists(filePath: string | undefined): void {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export async function createCandidate({ data, file }: CreateCandidateParams) {
  const email = data.email.trim().toLowerCase();

  let cvFileName: string | null = null;
  let cvPath: string | null = null;
  let cvMimeType: string | null = null;

  if (file) {
    cvFileName = file.originalname;
    cvPath = path.relative(process.cwd(), file.path);
    cvMimeType = file.mimetype;
  }

  try {
    return await prisma.candidate.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email,
        phone: data.phone ?? null,
        address: data.address ?? null,
        education: data.education ?? null,
        experience: data.experience ?? null,
        cvFileName,
        cvPath,
        cvMimeType,
      },
    });
  } catch (error) {
    removeFileIfExists(file?.path);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new DuplicateEmailError();
    }

    throw error;
  }
}
