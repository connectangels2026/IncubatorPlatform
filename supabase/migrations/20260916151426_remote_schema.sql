drop policy "Founders see own application" on "public"."applications";

drop policy "Founders manage own startup" on "public"."startups";

alter table "public"."organizations" drop constraint "valid_subscription_tier";

alter table "public"."startups" drop constraint "valid_stage";

alter table "public"."user_roles" drop constraint "valid_role";


  create table "public"."billing_invoices" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "subscription_id" uuid,
    "invoice_number" character varying(50) not null,
    "invoice_date" date not null,
    "due_date" date not null,
    "amount" numeric(10,2) not null,
    "currency" character varying(3) default 'INR'::character varying,
    "payment_status" character varying(50) default 'unpaid'::character varying,
    "paid_date" date,
    "payment_method" character varying(50),
    "transaction_id" character varying(255),
    "description" text,
    "notes" text,
    "invoice_url" character varying(500),
    "created_at" timestamp without time zone default now(),
    "created_by" uuid
      );


alter table "public"."billing_invoices" enable row level security;


  create table "public"."organization_activity_log" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "action" character varying(100) not null,
    "description" text,
    "triggered_by" character varying(50),
    "triggered_by_id" uuid,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp without time zone default now()
      );


alter table "public"."organization_activity_log" enable row level security;


  create table "public"."organization_subscriptions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "tier" character varying(50) default 'free'::character varying,
    "status" character varying(50) default 'active'::character varying,
    "monthly_cost" numeric(10,2) default 0,
    "annual_cost" numeric(10,2),
    "currency" character varying(3) default 'INR'::character varying,
    "billing_email" character varying(255),
    "trial_start_date" date,
    "trial_end_date" date,
    "trial_days_remaining" integer,
    "payment_method" character varying(50),
    "payment_method_id" character varying(255),
    "next_billing_date" date,
    "last_payment_date" date,
    "last_payment_amount" numeric(10,2),
    "last_payment_transaction_id" character varying(255),
    "payment_status" character varying(50) default 'pending'::character varying,
    "days_overdue" integer default 0,
    "is_blocked" boolean default false,
    "block_reason" character varying(255),
    "blocked_at" timestamp without time zone,
    "blocked_by" uuid,
    "max_startups" integer default 20,
    "max_mentors" integer default 10,
    "max_users" integer default 50,
    "features_enabled" jsonb default '{"reports": true, "api_access": false, "csv_export": true, "mentorship": true, "ai_features": false, "evaluations": true}'::jsonb,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now(),
    "created_by" uuid
      );


alter table "public"."organization_subscriptions" enable row level security;


  create table "public"."payment_reminders" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "invoice_id" uuid,
    "reminder_type" character varying(50),
    "days_before_due" integer,
    "is_sent" boolean default false,
    "sent_at" timestamp without time zone,
    "email_sent_to" character varying(255),
    "created_at" timestamp without time zone default now()
      );


alter table "public"."payment_reminders" enable row level security;


  create table "public"."pricing_tiers" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "tier_name" character varying(50) not null,
    "display_name" character varying(100),
    "monthly_price" numeric(10,2),
    "annual_price" numeric(10,2),
    "currency" character varying(3) default 'INR'::character varying,
    "max_startups" integer,
    "max_mentors" integer,
    "max_users" integer,
    "max_applications_per_month" integer,
    "features" jsonb default '{}'::jsonb,
    "description" text,
    "is_active" boolean default true,
    "display_order" integer default 0,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now(),
    "created_by" uuid
      );


alter table "public"."pricing_tiers" enable row level security;


  create table "public"."super_admins" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "email" character varying(255) not null,
    "full_name" character varying(255) not null,
    "phone" character varying(20),
    "profile_picture_url" character varying(500),
    "can_view_all_orgs" boolean default true,
    "can_manage_billing" boolean default true,
    "can_block_orgs" boolean default true,
    "can_manage_staff" boolean default true,
    "can_manage_pricing" boolean default true,
    "is_active" boolean default true,
    "last_login_at" timestamp without time zone,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now()
      );


alter table "public"."super_admins" enable row level security;

CREATE UNIQUE INDEX billing_invoices_invoice_number_key ON public.billing_invoices USING btree (invoice_number);

CREATE UNIQUE INDEX billing_invoices_pkey ON public.billing_invoices USING btree (id);

CREATE INDEX idx_activity_log_action ON public.organization_activity_log USING btree (action);

CREATE INDEX idx_activity_log_created_at ON public.organization_activity_log USING btree (created_at);

CREATE INDEX idx_activity_log_organization_id ON public.organization_activity_log USING btree (organization_id);

CREATE INDEX idx_billing_invoices_invoice_date ON public.billing_invoices USING btree (invoice_date);

CREATE INDEX idx_billing_invoices_organization_id ON public.billing_invoices USING btree (organization_id);

CREATE INDEX idx_billing_invoices_payment_status ON public.billing_invoices USING btree (payment_status);

CREATE INDEX idx_org_subscriptions_is_blocked ON public.organization_subscriptions USING btree (is_blocked);

CREATE INDEX idx_org_subscriptions_organization_id ON public.organization_subscriptions USING btree (organization_id);

CREATE INDEX idx_org_subscriptions_payment_status ON public.organization_subscriptions USING btree (payment_status);

CREATE INDEX idx_org_subscriptions_status ON public.organization_subscriptions USING btree (status);

CREATE INDEX idx_org_subscriptions_tier ON public.organization_subscriptions USING btree (tier);

CREATE INDEX idx_payment_reminders_is_sent ON public.payment_reminders USING btree (is_sent);

CREATE INDEX idx_payment_reminders_organization_id ON public.payment_reminders USING btree (organization_id);

CREATE INDEX idx_super_admins_email ON public.super_admins USING btree (email);

CREATE INDEX idx_super_admins_is_active ON public.super_admins USING btree (is_active);

CREATE UNIQUE INDEX organization_activity_log_pkey ON public.organization_activity_log USING btree (id);

CREATE UNIQUE INDEX organization_subscriptions_pkey ON public.organization_subscriptions USING btree (id);

CREATE UNIQUE INDEX payment_reminders_pkey ON public.payment_reminders USING btree (id);

CREATE UNIQUE INDEX pricing_tiers_pkey ON public.pricing_tiers USING btree (id);

CREATE UNIQUE INDEX pricing_tiers_tier_name_key ON public.pricing_tiers USING btree (tier_name);

CREATE UNIQUE INDEX super_admins_email_key ON public.super_admins USING btree (email);

CREATE UNIQUE INDEX super_admins_pkey ON public.super_admins USING btree (id);

alter table "public"."billing_invoices" add constraint "billing_invoices_pkey" PRIMARY KEY using index "billing_invoices_pkey";

alter table "public"."organization_activity_log" add constraint "organization_activity_log_pkey" PRIMARY KEY using index "organization_activity_log_pkey";

alter table "public"."organization_subscriptions" add constraint "organization_subscriptions_pkey" PRIMARY KEY using index "organization_subscriptions_pkey";

alter table "public"."payment_reminders" add constraint "payment_reminders_pkey" PRIMARY KEY using index "payment_reminders_pkey";

alter table "public"."pricing_tiers" add constraint "pricing_tiers_pkey" PRIMARY KEY using index "pricing_tiers_pkey";

alter table "public"."super_admins" add constraint "super_admins_pkey" PRIMARY KEY using index "super_admins_pkey";

alter table "public"."billing_invoices" add constraint "billing_invoices_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.super_admins(id) ON DELETE SET NULL not valid;

alter table "public"."billing_invoices" validate constraint "billing_invoices_created_by_fkey";

alter table "public"."billing_invoices" add constraint "billing_invoices_invoice_number_key" UNIQUE using index "billing_invoices_invoice_number_key";

alter table "public"."billing_invoices" add constraint "billing_invoices_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."billing_invoices" validate constraint "billing_invoices_organization_id_fkey";

alter table "public"."billing_invoices" add constraint "billing_invoices_subscription_id_fkey" FOREIGN KEY (subscription_id) REFERENCES public.organization_subscriptions(id) ON DELETE SET NULL not valid;

alter table "public"."billing_invoices" validate constraint "billing_invoices_subscription_id_fkey";

alter table "public"."organization_activity_log" add constraint "organization_activity_log_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."organization_activity_log" validate constraint "organization_activity_log_organization_id_fkey";

alter table "public"."organization_activity_log" add constraint "organization_activity_log_triggered_by_id_fkey" FOREIGN KEY (triggered_by_id) REFERENCES public.super_admins(id) ON DELETE SET NULL not valid;

alter table "public"."organization_activity_log" validate constraint "organization_activity_log_triggered_by_id_fkey";

alter table "public"."organization_subscriptions" add constraint "organization_subscriptions_blocked_by_fkey" FOREIGN KEY (blocked_by) REFERENCES public.super_admins(id) ON DELETE SET NULL not valid;

alter table "public"."organization_subscriptions" validate constraint "organization_subscriptions_blocked_by_fkey";

alter table "public"."organization_subscriptions" add constraint "organization_subscriptions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.super_admins(id) ON DELETE SET NULL not valid;

alter table "public"."organization_subscriptions" validate constraint "organization_subscriptions_created_by_fkey";

alter table "public"."organization_subscriptions" add constraint "organization_subscriptions_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."organization_subscriptions" validate constraint "organization_subscriptions_organization_id_fkey";

alter table "public"."payment_reminders" add constraint "payment_reminders_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES public.billing_invoices(id) ON DELETE SET NULL not valid;

alter table "public"."payment_reminders" validate constraint "payment_reminders_invoice_id_fkey";

alter table "public"."payment_reminders" add constraint "payment_reminders_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."payment_reminders" validate constraint "payment_reminders_organization_id_fkey";

alter table "public"."pricing_tiers" add constraint "pricing_tiers_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.super_admins(id) ON DELETE SET NULL not valid;

alter table "public"."pricing_tiers" validate constraint "pricing_tiers_created_by_fkey";

alter table "public"."pricing_tiers" add constraint "pricing_tiers_tier_name_key" UNIQUE using index "pricing_tiers_tier_name_key";

alter table "public"."super_admins" add constraint "super_admins_email_key" UNIQUE using index "super_admins_email_key";

alter table "public"."organizations" add constraint "valid_subscription_tier" CHECK (((subscription_tier)::text = ANY ((ARRAY['free'::character varying, 'pro'::character varying, 'enterprise'::character varying])::text[]))) not valid;

alter table "public"."organizations" validate constraint "valid_subscription_tier";

alter table "public"."startups" add constraint "valid_stage" CHECK (((stage)::text = ANY ((ARRAY['Idea'::character varying, 'MVP'::character varying, 'Pre-revenue'::character varying, 'Revenue'::character varying, 'Growth'::character varying, 'Scale'::character varying])::text[]))) not valid;

alter table "public"."startups" validate constraint "valid_stage";

alter table "public"."user_roles" add constraint "valid_role" CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'startup_founder'::character varying, 'mentor'::character varying, 'investor'::character varying, 'judge'::character varying, 'faculty'::character varying, 'partner'::character varying])::text[]))) not valid;

alter table "public"."user_roles" validate constraint "valid_role";

grant delete on table "public"."billing_invoices" to "anon";

grant insert on table "public"."billing_invoices" to "anon";

grant references on table "public"."billing_invoices" to "anon";

grant select on table "public"."billing_invoices" to "anon";

grant trigger on table "public"."billing_invoices" to "anon";

grant truncate on table "public"."billing_invoices" to "anon";

grant update on table "public"."billing_invoices" to "anon";

grant delete on table "public"."billing_invoices" to "authenticated";

grant insert on table "public"."billing_invoices" to "authenticated";

grant references on table "public"."billing_invoices" to "authenticated";

grant select on table "public"."billing_invoices" to "authenticated";

grant trigger on table "public"."billing_invoices" to "authenticated";

grant truncate on table "public"."billing_invoices" to "authenticated";

grant update on table "public"."billing_invoices" to "authenticated";

grant delete on table "public"."billing_invoices" to "service_role";

grant insert on table "public"."billing_invoices" to "service_role";

grant references on table "public"."billing_invoices" to "service_role";

grant select on table "public"."billing_invoices" to "service_role";

grant trigger on table "public"."billing_invoices" to "service_role";

grant truncate on table "public"."billing_invoices" to "service_role";

grant update on table "public"."billing_invoices" to "service_role";

grant delete on table "public"."organization_activity_log" to "anon";

grant insert on table "public"."organization_activity_log" to "anon";

grant references on table "public"."organization_activity_log" to "anon";

grant select on table "public"."organization_activity_log" to "anon";

grant trigger on table "public"."organization_activity_log" to "anon";

grant truncate on table "public"."organization_activity_log" to "anon";

grant update on table "public"."organization_activity_log" to "anon";

grant delete on table "public"."organization_activity_log" to "authenticated";

grant insert on table "public"."organization_activity_log" to "authenticated";

grant references on table "public"."organization_activity_log" to "authenticated";

grant select on table "public"."organization_activity_log" to "authenticated";

grant trigger on table "public"."organization_activity_log" to "authenticated";

grant truncate on table "public"."organization_activity_log" to "authenticated";

grant update on table "public"."organization_activity_log" to "authenticated";

grant delete on table "public"."organization_activity_log" to "service_role";

grant insert on table "public"."organization_activity_log" to "service_role";

grant references on table "public"."organization_activity_log" to "service_role";

grant select on table "public"."organization_activity_log" to "service_role";

grant trigger on table "public"."organization_activity_log" to "service_role";

grant truncate on table "public"."organization_activity_log" to "service_role";

grant update on table "public"."organization_activity_log" to "service_role";

grant delete on table "public"."organization_subscriptions" to "anon";

grant insert on table "public"."organization_subscriptions" to "anon";

grant references on table "public"."organization_subscriptions" to "anon";

grant select on table "public"."organization_subscriptions" to "anon";

grant trigger on table "public"."organization_subscriptions" to "anon";

grant truncate on table "public"."organization_subscriptions" to "anon";

grant update on table "public"."organization_subscriptions" to "anon";

grant delete on table "public"."organization_subscriptions" to "authenticated";

grant insert on table "public"."organization_subscriptions" to "authenticated";

grant references on table "public"."organization_subscriptions" to "authenticated";

grant select on table "public"."organization_subscriptions" to "authenticated";

grant trigger on table "public"."organization_subscriptions" to "authenticated";

grant truncate on table "public"."organization_subscriptions" to "authenticated";

grant update on table "public"."organization_subscriptions" to "authenticated";

grant delete on table "public"."organization_subscriptions" to "service_role";

grant insert on table "public"."organization_subscriptions" to "service_role";

grant references on table "public"."organization_subscriptions" to "service_role";

grant select on table "public"."organization_subscriptions" to "service_role";

grant trigger on table "public"."organization_subscriptions" to "service_role";

grant truncate on table "public"."organization_subscriptions" to "service_role";

grant update on table "public"."organization_subscriptions" to "service_role";

grant delete on table "public"."payment_reminders" to "anon";

grant insert on table "public"."payment_reminders" to "anon";

grant references on table "public"."payment_reminders" to "anon";

grant select on table "public"."payment_reminders" to "anon";

grant trigger on table "public"."payment_reminders" to "anon";

grant truncate on table "public"."payment_reminders" to "anon";

grant update on table "public"."payment_reminders" to "anon";

grant delete on table "public"."payment_reminders" to "authenticated";

grant insert on table "public"."payment_reminders" to "authenticated";

grant references on table "public"."payment_reminders" to "authenticated";

grant select on table "public"."payment_reminders" to "authenticated";

grant trigger on table "public"."payment_reminders" to "authenticated";

grant truncate on table "public"."payment_reminders" to "authenticated";

grant update on table "public"."payment_reminders" to "authenticated";

grant delete on table "public"."payment_reminders" to "service_role";

grant insert on table "public"."payment_reminders" to "service_role";

grant references on table "public"."payment_reminders" to "service_role";

grant select on table "public"."payment_reminders" to "service_role";

grant trigger on table "public"."payment_reminders" to "service_role";

grant truncate on table "public"."payment_reminders" to "service_role";

grant update on table "public"."payment_reminders" to "service_role";

grant delete on table "public"."pricing_tiers" to "anon";

grant insert on table "public"."pricing_tiers" to "anon";

grant references on table "public"."pricing_tiers" to "anon";

grant select on table "public"."pricing_tiers" to "anon";

grant trigger on table "public"."pricing_tiers" to "anon";

grant truncate on table "public"."pricing_tiers" to "anon";

grant update on table "public"."pricing_tiers" to "anon";

grant delete on table "public"."pricing_tiers" to "authenticated";

grant insert on table "public"."pricing_tiers" to "authenticated";

grant references on table "public"."pricing_tiers" to "authenticated";

grant select on table "public"."pricing_tiers" to "authenticated";

grant trigger on table "public"."pricing_tiers" to "authenticated";

grant truncate on table "public"."pricing_tiers" to "authenticated";

grant update on table "public"."pricing_tiers" to "authenticated";

grant delete on table "public"."pricing_tiers" to "service_role";

grant insert on table "public"."pricing_tiers" to "service_role";

grant references on table "public"."pricing_tiers" to "service_role";

grant select on table "public"."pricing_tiers" to "service_role";

grant trigger on table "public"."pricing_tiers" to "service_role";

grant truncate on table "public"."pricing_tiers" to "service_role";

grant update on table "public"."pricing_tiers" to "service_role";

grant delete on table "public"."super_admins" to "anon";

grant insert on table "public"."super_admins" to "anon";

grant references on table "public"."super_admins" to "anon";

grant select on table "public"."super_admins" to "anon";

grant trigger on table "public"."super_admins" to "anon";

grant truncate on table "public"."super_admins" to "anon";

grant update on table "public"."super_admins" to "anon";

grant delete on table "public"."super_admins" to "authenticated";

grant insert on table "public"."super_admins" to "authenticated";

grant references on table "public"."super_admins" to "authenticated";

grant select on table "public"."super_admins" to "authenticated";

grant trigger on table "public"."super_admins" to "authenticated";

grant truncate on table "public"."super_admins" to "authenticated";

grant update on table "public"."super_admins" to "authenticated";

grant delete on table "public"."super_admins" to "service_role";

grant insert on table "public"."super_admins" to "service_role";

grant references on table "public"."super_admins" to "service_role";

grant select on table "public"."super_admins" to "service_role";

grant trigger on table "public"."super_admins" to "service_role";

grant truncate on table "public"."super_admins" to "service_role";

grant update on table "public"."super_admins" to "service_role";


  create policy "Super admin sees all invoices"
  on "public"."billing_invoices"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.super_admins
  WHERE (((super_admins.email)::text = auth.email()) AND (super_admins.is_active = true)))));



  create policy "Super admin sees all activity"
  on "public"."organization_activity_log"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.super_admins
  WHERE (((super_admins.email)::text = auth.email()) AND (super_admins.is_active = true)))));



  create policy "Super admin manages all orgs"
  on "public"."organization_subscriptions"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.super_admins
  WHERE (((super_admins.email)::text = auth.email()) AND (super_admins.is_active = true) AND (super_admins.can_manage_billing = true)))));



  create policy "Super admin sees all data"
  on "public"."organization_subscriptions"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.super_admins
  WHERE (((super_admins.email)::text = auth.email()) AND (super_admins.is_active = true)))));



  create policy "Founders see own application"
  on "public"."applications"
  as permissive
  for select
  to public
using ((((applicant_email)::text = (( SELECT users.email
   FROM public.users
  WHERE (users.id = auth.uid())))::text) OR (organization_id IN ( SELECT user_roles.organization_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND ((user_roles.role)::text = ANY ((ARRAY['admin'::character varying, 'mentor'::character varying])::text[])))))));



  create policy "Founders manage own startup"
  on "public"."startups"
  as permissive
  for all
  to public
using (((founder_id = auth.uid()) OR (organization_id IN ( SELECT user_roles.organization_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND ((user_roles.role)::text = ANY ((ARRAY['admin'::character varying, 'mentor'::character varying])::text[])))))));



