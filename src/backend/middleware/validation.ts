import { NextResponse } from 'next/server';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  validator?: (value: any) => boolean;
  message?: string;
}

export function validatePayload(body: Record<string, any>, rules: ValidationRule[]): { valid: boolean; errorResponse?: NextResponse } {
  const errors: string[] = [];

  for (const rule of rules) {
    const val = body[rule.field];

    if (rule.required && (val === undefined || val === null || val === '')) {
      errors.push(rule.message || `${rule.field} is required`);
      continue;
    }

    if (val !== undefined && rule.type) {
      if (rule.type === 'array' && !Array.isArray(val)) {
        errors.push(`${rule.field} must be an array`);
      } else if (rule.type !== 'array' && typeof val !== rule.type) {
        errors.push(`${rule.field} must be a ${rule.type}`);
      }
    }

    if (val !== undefined && rule.validator && !rule.validator(val)) {
      errors.push(rule.message || `${rule.field} is invalid`);
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errorResponse: NextResponse.json({ error: 'Validation Failed', details: errors }, { status: 400 }),
    };
  }

  return { valid: true };
}
