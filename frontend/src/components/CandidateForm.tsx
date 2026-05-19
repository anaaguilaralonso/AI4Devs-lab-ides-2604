import React, { FormEvent, useState } from 'react';
import { CandidateApiError, CandidateFormValues } from '../types/candidate';
import '../styles/candidate-form.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_CV_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV_EXTENSIONS = ['.pdf', '.docx'];

const initialValues: CandidateFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  education: '',
  experience: '',
  cv: null,
};

interface CandidateFormProps {
  onSubmit: (values: CandidateFormValues) => Promise<void>;
  disabled?: boolean;
}

export function validateCandidateForm(
  values: CandidateFormValues,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (values.firstName.trim().length > 100) {
    errors.firstName = 'First name must not exceed 100 characters';
  }

  if (!values.lastName.trim()) {
    errors.lastName = 'Last name is required';
  } else if (values.lastName.trim().length > 100) {
    errors.lastName = 'Last name must not exceed 100 characters';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Invalid email address';
  } else if (values.email.trim().length > 255) {
    errors.email = 'Email must not exceed 255 characters';
  }

  if (values.phone.trim().length > 30) {
    errors.phone = 'Phone must not exceed 30 characters';
  }

  if (values.address.trim().length > 500) {
    errors.address = 'Address must not exceed 500 characters';
  }

  if (values.education.trim().length > 5000) {
    errors.education = 'Education must not exceed 5000 characters';
  }

  if (values.experience.trim().length > 5000) {
    errors.experience = 'Work experience must not exceed 5000 characters';
  }

  if (values.cv) {
    const extension = values.cv.name
      .slice(values.cv.name.lastIndexOf('.'))
      .toLowerCase();
    if (!ALLOWED_CV_EXTENSIONS.includes(extension)) {
      errors.cv = 'Only PDF or DOCX files are allowed';
    } else if (values.cv.size > MAX_CV_BYTES) {
      errors.cv = 'File size must not exceed 5 MB';
    }
  }

  return errors;
}

function buildFormData(values: CandidateFormValues): FormData {
  const formData = new FormData();
  formData.append('firstName', values.firstName.trim());
  formData.append('lastName', values.lastName.trim());
  formData.append('email', values.email.trim());

  if (values.phone.trim()) formData.append('phone', values.phone.trim());
  if (values.address.trim()) formData.append('address', values.address.trim());
  if (values.education.trim()) formData.append('education', values.education.trim());
  if (values.experience.trim()) formData.append('experience', values.experience.trim());
  if (values.cv) formData.append('cv', values.cv);

  return formData;
}

export { buildFormData };

export default function CandidateForm({ onSubmit, disabled }: CandidateFormProps) {
  const [values, setValues] = useState<CandidateFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setServerErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setValues((prev) => ({ ...prev, cv: file }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.cv;
      return next;
    });
  };

  const fieldError = (name: string) =>
    errors[name] || serverErrors[name];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validateCandidateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerErrors({});

    try {
      await onSubmit(values);
      setValues(initialValues);
    } catch (error) {
      if (error instanceof CandidateApiError && error.errors) {
        setServerErrors(error.errors);
        return;
      }
      throw error;
    }
  };

  return (
    <form className="candidate-form" onSubmit={handleSubmit} noValidate>
      <div className="candidate-form__grid">
        <div className="form-field">
          <label htmlFor="firstName">First name *</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={values.firstName}
            onChange={handleChange}
            aria-invalid={Boolean(fieldError('firstName'))}
            aria-describedby={fieldError('firstName') ? 'firstName-error' : undefined}
            disabled={disabled}
            autoComplete="given-name"
          />
          {fieldError('firstName') && (
            <span id="firstName-error" className="form-field__error" role="alert">
              {fieldError('firstName')}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="lastName">Last name *</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={values.lastName}
            onChange={handleChange}
            aria-invalid={Boolean(fieldError('lastName'))}
            aria-describedby={fieldError('lastName') ? 'lastName-error' : undefined}
            disabled={disabled}
            autoComplete="family-name"
          />
          {fieldError('lastName') && (
            <span id="lastName-error" className="form-field__error" role="alert">
              {fieldError('lastName')}
            </span>
          )}
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            aria-invalid={Boolean(fieldError('email'))}
            aria-describedby={fieldError('email') ? 'email-error' : undefined}
            disabled={disabled}
            autoComplete="email"
          />
          {fieldError('email') && (
            <span id="email-error" className="form-field__error" role="alert">
              {fieldError('email')}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            aria-invalid={Boolean(fieldError('phone'))}
            aria-describedby={fieldError('phone') ? 'phone-error' : undefined}
            disabled={disabled}
            autoComplete="tel"
          />
          {fieldError('phone') && (
            <span id="phone-error" className="form-field__error" role="alert">
              {fieldError('phone')}
            </span>
          )}
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="address">Address</label>
          <input
            id="address"
            name="address"
            type="text"
            value={values.address}
            onChange={handleChange}
            aria-invalid={Boolean(fieldError('address'))}
            aria-describedby={fieldError('address') ? 'address-error' : undefined}
            disabled={disabled}
            autoComplete="street-address"
          />
          {fieldError('address') && (
            <span id="address-error" className="form-field__error" role="alert">
              {fieldError('address')}
            </span>
          )}
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="education">Education</label>
          <textarea
            id="education"
            name="education"
            rows={4}
            value={values.education}
            onChange={handleChange}
            aria-invalid={Boolean(fieldError('education'))}
            aria-describedby={fieldError('education') ? 'education-error' : undefined}
            disabled={disabled}
          />
          {fieldError('education') && (
            <span id="education-error" className="form-field__error" role="alert">
              {fieldError('education')}
            </span>
          )}
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="experience">Work experience</label>
          <textarea
            id="experience"
            name="experience"
            rows={4}
            value={values.experience}
            onChange={handleChange}
            aria-invalid={Boolean(fieldError('experience'))}
            aria-describedby={fieldError('experience') ? 'experience-error' : undefined}
            disabled={disabled}
          />
          {fieldError('experience') && (
            <span id="experience-error" className="form-field__error" role="alert">
              {fieldError('experience')}
            </span>
          )}
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="cv">CV (PDF or DOCX, max 5 MB)</label>
          <input
            id="cv"
            name="cv"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            aria-invalid={Boolean(fieldError('cv'))}
            aria-describedby={fieldError('cv') ? 'cv-error' : undefined}
            disabled={disabled}
          />
          {fieldError('cv') && (
            <span id="cv-error" className="form-field__error" role="alert">
              {fieldError('cv')}
            </span>
          )}
        </div>
      </div>

      <div className="candidate-form__actions">
        <button type="submit" className="btn btn--primary" disabled={disabled}>
          {disabled ? 'Saving...' : 'Add candidate'}
        </button>
      </div>
    </form>
  );
}
