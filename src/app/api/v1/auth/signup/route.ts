import { NextResponse } from 'next/server';
import { signUp } from '@/backend/services/auth';
import { logAuthEvent } from '@/backend/lib/session';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(pwd: string): string | null {
  if (pwd.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character';
  return null;
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Edge Case: Email Regex Validation
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 2. Edge Case: Strong Password Validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 }
      );
    }

    // 3. Edge Case: Duplicate User Check
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const duplicateUser = usersData?.users?.some(
      (u) => u.email?.toLowerCase() === trimmedEmail
    );

    if (duplicateUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Proceed to create user
    const { data, error } = await signUp(trimmedEmail, password);

    if (error) {
      await logAuthEvent('failed_attempt');
      return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }

    return NextResponse.json({ user: data.user, session: data.session }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
