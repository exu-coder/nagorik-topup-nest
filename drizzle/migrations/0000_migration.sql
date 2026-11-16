-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.admin_exists()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;
grant execute on function public.admin_exists() to anon, authenticated;

-- First signed-in account may claim admin, only while no admin exists.
create or replace function public.claim_first_admin()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  perform pg_advisory_xact_lock(424242);
  if exists (select 1 from public.user_roles where role = 'admin') then return false; end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin');
  return true;
end $$;
revoke execute on function public.claim_first_admin() from public, anon;
grant execute on function public.claim_first_admin() to authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- Product packages (prices editable by admin)
create table public.product_packages (
  id text primary key,
  category_slug text not null,
  title text not null,
  detail text not null default '',
  price numeric(10,2) not null check (price > 0),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_packages_category_idx on public.product_packages (category_slug, sort_order);
grant select on public.product_packages to anon;
grant select, insert, update, delete on public.product_packages to authenticated;
grant all on public.product_packages to service_role;
alter table public.product_packages enable row level security;
create policy "Anyone reads active packages" on public.product_packages
  for select to anon, authenticated using (active or public.has_role(auth.uid(), 'admin'));
create policy "Admins insert packages" on public.product_packages
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update packages" on public.product_packages
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete packages" on public.product_packages
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger product_packages_touch before update on public.product_packages
  for each row execute function public.touch_updated_at();

-- Per-category settings (on/off + custom quantity pricing)
create table public.category_settings (
  slug text primary key,
  active boolean not null default true,
  custom_price_per_step numeric(10,2) check (custom_price_per_step is null or custom_price_per_step > 0),
  custom_step integer check (custom_step is null or custom_step > 0),
  custom_min integer check (custom_min is null or custom_min > 0),
  custom_max integer check (custom_max is null or custom_max > 0),
  updated_at timestamptz not null default now()
);
grant select on public.category_settings to anon;
grant select, insert, update on public.category_settings to authenticated;
grant all on public.category_settings to service_role;
alter table public.category_settings enable row level security;
create policy "Anyone reads category settings" on public.category_settings
  for select to anon, authenticated using (true);
create policy "Admins insert category settings" on public.category_settings
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update category settings" on public.category_settings
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger category_settings_touch before update on public.category_settings
  for each row execute function public.touch_updated_at();

-- Customers (buyers, identified by email)
create table public.customers (
  email text primary key,
  name text not null default '',
  phone text not null default '',
  blocked boolean not null default false,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.customers to authenticated;
grant all on public.customers to service_role;
alter table public.customers enable row level security;
create policy "Admins read customers" on public.customers
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update customers" on public.customers
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger customers_touch before update on public.customers
  for each row execute function public.touch_updated_at();

-- Orders
create type public.order_status as enum ('pending', 'paid', 'processing', 'delivered', 'failed', 'cancelled', 'refunded');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  category_slug text not null,
  item_label text not null,
  selection jsonb not null default '{}'::jsonb,
  target_id text not null,
  customer_name text not null,
  customer_email text not null,
  phone text not null default '',
  amount numeric(10,2) not null,
  status public.order_status not null default 'pending',
  transaction_id text unique,
  payment_method text,
  paid_at timestamptz,
  admin_note text not null default ''
);
create index orders_created_idx on public.orders (created_at desc);
create index orders_status_idx on public.orders (status);
create index orders_email_idx on public.orders (customer_email);
grant select, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Admins read orders" on public.orders
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update orders" on public.orders
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete orders" on public.orders
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- Admin aggregates
create or replace function public.admin_dashboard_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  result jsonb;
  day_start timestamptz := date_trunc('day', now() at time zone 'Asia/Dhaka') at time zone 'Asia/Dhaka';
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  select jsonb_build_object(
    'today_revenue', coalesce((select sum(amount) from orders where status in ('paid','processing','delivered') and paid_at >= day_start), 0),
    'today_orders', (select count(*) from orders where status in ('paid','processing','delivered') and paid_at >= day_start),
    'total_revenue', coalesce((select sum(amount) from orders where status in ('paid','processing','delivered')), 0),
    'total_paid_orders', (select count(*) from orders where status in ('paid','processing','delivered')),
    'to_deliver', (select count(*) from orders where status in ('paid','processing')),
    'customers', (select count(*) from customers),
    'by_status', coalesce((select jsonb_object_agg(s.status, s.n) from (select status, count(*) as n from orders group by status) s), '{}'::jsonb),
    'last7', coalesce((
      select jsonb_agg(jsonb_build_object('day', g.d::date, 'revenue', coalesce(r.revenue, 0), 'orders', coalesce(r.n, 0)) order by g.d)
      from generate_series((now() at time zone 'Asia/Dhaka')::date - 6, (now() at time zone 'Asia/Dhaka')::date, interval '1 day') as g(d)
      left join (
        select (paid_at at time zone 'Asia/Dhaka')::date as sale_day, sum(amount) as revenue, count(*) as n
        from orders where status in ('paid','processing','delivered') and paid_at is not null
        group by 1
      ) r on r.sale_day = g.d::date
    ), '[]'::jsonb)
  ) into result;
  return result;
end $$;
revoke execute on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;

create or replace function public.admin_customer_summary()
returns table (email text, name text, phone text, blocked boolean, note text, created_at timestamptz, order_count bigint, paid_total numeric, last_order_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  return query
    select c.email, c.name, c.phone, c.blocked, c.note, c.created_at,
      count(o.id) as order_count,
      coalesce(sum(o.amount) filter (where o.status in ('paid','processing','delivered')), 0) as paid_total,
      max(o.created_at) as last_order_at
    from customers c left join orders o on o.customer_email = c.email
    group by c.email
    order by max(o.created_at) desc nulls last;
end $$;
revoke execute on function public.admin_customer_summary() from public, anon;
grant execute on function public.admin_customer_summary() to authenticated;

-- Seed current catalog prices
insert into public.product_packages (id, category_slug, title, detail, price, sort_order) values
  ('likes-200', 'freefire-likes', '200 likes', 'Instant', 4, 1),
  ('likes-1600', 'freefire-likes', '1600 likes', '8 days', 32, 2),
  ('likes-3000', 'freefire-likes', '3000 likes', '15 days', 60, 3),
  ('likes-6000', 'freefire-likes', '6000 likes', '30 days', 120, 4),
  ('glory-5k', 'guild-glory', '5,000 Glory', '1–2 days', 50, 1),
  ('glory-10k', 'guild-glory', '10,000 Glory', '2–3 days', 95, 2),
  ('glory-25k', 'guild-glory', '25,000 Glory', '5 days', 220, 3),
  ('glory-50k', 'guild-glory', '50,000 Glory', '7 days', 420, 4),
  ('tcp-7', 'tcp-bot', 'TCP Bot', '7 days', 99, 1),
  ('tcp-15', 'tcp-bot', 'TCP Bot', '15 days', 179, 2),
  ('tcp-30', 'tcp-bot', 'TCP Bot', '30 days', 299, 3);

insert into public.category_settings (slug, active, custom_price_per_step, custom_step, custom_min, custom_max) values
  ('freefire-likes', true, 4, 200, 1600, 50000),
  ('guild-glory', true, null, null, null, null),
  ('tcp-bot', true, null, null, null, null);