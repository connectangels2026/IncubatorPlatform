
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { verifyAuth } from '@/backend/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase organizations fetch error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await verifyAuth(req);

    if (errorResponse) return errorResponse;

    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Prevent startup accounts from creating organizations
    if (user.role === 'startup') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Startup accounts cannot create incubator organizations',
        },
        { status: 403 }
      );
    }

    if (user.email) {
      const { data: dbUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('email', user.email)
        .maybeSingle();

      if (userError) throw userError;

      if (dbUser?.role === 'startup') {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: Startup accounts cannot create incubator organizations',
          },
          { status: 403 }
        );
      }
    }

    const body = await req.json();

    const {
      name,
      description,
      logo_url,
      primary_color,
      secondary_color,
      founder_name,
      founderName,
      founder_email,
      billing_email,
      phone,
      website,
      address,
      city,
      state,
      country,
      postal_code,
      tier = 'free',
      billing_cycle = 'annual',
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Organization name is required' },
        { status: 400 }
      );
    }

    const cleanTier = ['free', 'pro', 'enterprise'].includes(tier)
      ? tier
      : 'free';

    const cleanCycle = billing_cycle === 'monthly' ? 'monthly' : 'annual';

    const maxStartups =
      cleanTier === 'enterprise' ? 9999 : cleanTier === 'pro' ? 100 : 20;

    const maxMentors =
      cleanTier === 'enterprise' ? 9999 : cleanTier === 'pro' ? 25 : 10;

    const now = new Date();
    const endsAt = new Date(now);

    if (cleanCycle === 'monthly') {
      endsAt.setDate(endsAt.getDate() + 30);
    } else {
      endsAt.setDate(endsAt.getDate() + 365);
    }

    const primaryEmail = (founder_email || user.email || '')?.trim() || null;
    const billEmail = (billing_email || primaryEmail)?.trim() || null;

    const resolvedFounder = (
      founder_name ||
      founderName ||
      user.email?.split('@')[0] ||
      'Director'
    ).trim();

    // 1. Check whether this authenticated user already has an organization
    const { data: existingOrg, error: existingOrgError } =
      await supabaseAdmin
        .from('organizations')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

    if (existingOrgError) throw existingOrgError;

    let organization = existingOrg;

    // 2. Create organization only if it does not already exist
    if (!organization) {
      const baseSlug =
        name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'incubator';

      let finalSlug = baseSlug;
      let suffix = 1;

      while (true) {
        const { data: existingSlug, error: slugError } =
          await supabaseAdmin
            .from('organizations')
            .select('id')
            .eq('slug', finalSlug)
            .maybeSingle();

        if (slugError) throw slugError;

        if (!existingSlug) break;

        suffix++;
        finalSlug = `${baseSlug}-${suffix}`;
      }

      const insertPayload: Record<string, any> = {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        logo_url: logo_url?.trim() || null,
        primary_color: primary_color?.trim() || '#1A2151',
        secondary_color: secondary_color?.trim() || '#0066ff',
        founder_name: resolvedFounder,
        founder_email: primaryEmail,
        email: primaryEmail,
        billing_email: billEmail,
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        country: country?.trim() || null,
        postal_code: postal_code?.trim() || null,
        auth_user_id: user.id,
        subscription_tier: cleanTier,
        subscription_status: 'active',
        subscription_started_at: now.toISOString(),
        subscription_ends_at: endsAt.toISOString(),
        max_startups_allowed: maxStartups,
        max_mentors_allowed: maxMentors,
        is_active: true,
        is_verified: false,
        billing_cycle: cleanCycle,
      };

      let result = await supabaseAdmin
        .from('organizations')
        .insert(insertPayload)
        .select()
        .single();

      // Fallback for databases without billing_cycle column
      if (result.error?.message?.includes('billing_cycle')) {
        delete insertPayload.billing_cycle;

        result = await supabaseAdmin
          .from('organizations')
          .insert(insertPayload)
          .select()
          .single();
      }

      // Handle simultaneous duplicate organization requests
      if (result.error?.code === '23505') {
        const { data: duplicateOrg, error: duplicateError } =
          await supabaseAdmin
            .from('organizations')
            .select('*')
            .eq('auth_user_id', user.id)
            .maybeSingle();

        if (duplicateError) throw duplicateError;

        if (duplicateOrg) {
          organization = duplicateOrg;
        } else {
          throw result.error;
        }
      } else if (result.error) {
        console.error('Failed to create organization:', result.error);
        throw result.error;
      } else {
        organization = result.data;
      }
    }

    if (!organization) {
      throw new Error('Organization could not be created or retrieved');
    }

    const orgId = organization.id;

    // 3. Check whether an active subscription already exists
    const { data: existingSub, error: existingSubError } =
      await supabaseAdmin
        .from('organization_subscriptions')
        .select('id, status, payment_status')
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

    if (existingSubError) throw existingSubError;

    let hasActiveSubscription = Boolean(
      existingSub?.id &&
      existingSub.status === 'active' &&
      existingSub.payment_status === 'paid'
    );

    // 4. Create subscription only if no active paid subscription exists
    if (!existingSub) {
      const { data: createdSub, error: subError } =
        await supabaseAdmin
          .from('organization_subscriptions')
          .insert({
            organization_id: orgId,
            tier: cleanTier,
            status: 'active',
            payment_status: 'paid',
            monthly_cost:
              cleanCycle === 'monthly'
                ? cleanTier === 'pro'
                  ? 4999
                  : cleanTier === 'enterprise'
                    ? 9999
                    : 0
                : 0,
            annual_cost:
              cleanCycle === 'annual'
                ? cleanTier === 'pro'
                  ? 39999
                  : cleanTier === 'enterprise'
                    ? 79999
                    : 0
                : 0,
            currency: 'INR',
            billing_email: billEmail,
            max_startups: maxStartups,
            max_mentors: maxMentors,
            created_by: user.id,
          })
          .select()
          .maybeSingle();

      if (subError) {
        console.error('Subscription insertion error:', subError);
      }

      hasActiveSubscription = Boolean(
        createdSub?.id &&
        createdSub.status === 'active' &&
        createdSub.payment_status === 'paid'
      );
    }

    // 5. Verify subscription if insertion did not return a record
    if (!hasActiveSubscription) {
      const { data: verifySub, error: verifyError } =
        await supabaseAdmin
          .from('organization_subscriptions')
          .select('id, status, payment_status')
          .eq('organization_id', orgId)
          .eq('status', 'active')
          .eq('payment_status', 'paid')
          .limit(1)
          .maybeSingle();

      if (verifyError) throw verifyError;

      hasActiveSubscription = Boolean(verifySub?.id);
    }

    // 6. Assign role based on confirmed subscription
    const assignedRole = hasActiveSubscription
      ? 'incubator_admin'
      : 'pending_incubator';

    // 7. Update public.users record
    if (user.email) {
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          organization_id: orgId,
          role: assignedRole,
        })
        .eq('email', user.email);

      if (updateError) throw updateError;
    }

    // 8. Update Supabase Auth metadata
    const { error: metadataError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          role: assignedRole,
          organization_id: orgId,
        },
      });

    if (metadataError) {
      console.error('Auth metadata update error:', metadataError);
    }

    // 9. Return organization
    return NextResponse.json({
      success: true,
      message: existingOrg
        ? 'Existing organization reused successfully'
        : 'Organization created successfully',
      data: organization,
      subscription_active: hasActiveSubscription,
      role: assignedRole,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown server error';

    console.error('Incubator organization API error:', err);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
