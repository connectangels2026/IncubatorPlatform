-- Add auth_user_id column to organizations table
alter table "public"."organizations"
add column "auth_user_id" uuid unique;

-- Create index for faster lookups by auth_user_id
create index "idx_organizations_auth_user_id" on "public"."organizations" using btree ("auth_user_id");

-- Add constraint to link to auth.users
alter table "public"."organizations"
add constraint "fk_organizations_auth_user_id"
foreign key ("auth_user_id")
references "auth"."users" ("id") on delete set null;
