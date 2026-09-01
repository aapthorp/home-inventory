alter table item add column item_type text not null default 'GENERIC';

create table book_details (
    id uuid primary key default gen_random_uuid(),
    item_id uuid not null unique references item(id) on delete cascade,
    isbn text,
    author text,
    page_count integer,
    publisher text,
    published_year integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create table film_details (
    id uuid primary key default gen_random_uuid(),
    item_id uuid not null unique references item(id) on delete cascade,
    director text,
    runtime_minutes integer,
    studio text,
    release_year integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create table music_album_details (
    id uuid primary key default gen_random_uuid(),
    item_id uuid not null unique references item(id) on delete cascade,
    artist text,
    label text,
    release_year integer,
    track_count integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);
