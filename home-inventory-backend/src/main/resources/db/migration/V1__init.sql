create extension if not exists "pgcrypto";

create table household (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create table location (
    id uuid primary key default gen_random_uuid(),
    household_id uuid not null references household(id),
    name text not null,
    parent_location_id uuid references location(id),
    type text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);
create index idx_location_household on location(household_id) where deleted_at is null;

create table category (
    id uuid primary key default gen_random_uuid(),
    household_id uuid not null references household(id),
    name text not null,
    parent_category_id uuid references category(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);
create index idx_category_household on category(household_id) where deleted_at is null;

create table collection (
    id uuid primary key default gen_random_uuid(),
    household_id uuid not null references household(id),
    name text not null,
    description text,
    type text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);
create index idx_collection_household on collection(household_id) where deleted_at is null;

create table item (
    id uuid primary key default gen_random_uuid(),
    household_id uuid not null references household(id),
    name text not null,
    description text,
    category_id uuid references category(id),
    location_id uuid references location(id),
    owner_user_id uuid,
    barcode text,
    brand text,
    model text,
    serial_number text,
    condition text not null default 'GOOD',
    quantity integer not null default 1,
    purchase_date date,
    purchase_price numeric(12,2),
    currency text,
    current_estimated_value numeric(12,2),
    warranty_expiry_date date,
    status text not null default 'OWNED',
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);
create index idx_item_household on item(household_id) where deleted_at is null;
create index idx_item_location on item(location_id);
create index idx_item_category on item(category_id);
create index idx_item_barcode on item(barcode);

create table item_tag (
    item_id uuid not null references item(id) on delete cascade,
    tag text not null,
    primary key (item_id, tag)
);

create table collection_item (
    item_id uuid not null references item(id) on delete cascade,
    collection_id uuid not null references collection(id) on delete cascade,
    primary key (item_id, collection_id)
);

create table item_attachment (
    id uuid primary key default gen_random_uuid(),
    item_id uuid not null references item(id) on delete cascade,
    type text not null,
    storage_url text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);
create index idx_attachment_item on item_attachment(item_id);
