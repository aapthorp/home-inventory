alter table item_attachment
    add column label text,
    add column content_type text,
    add column size_bytes bigint,
    add column sort_order integer not null default 0;

create index idx_attachment_item_sort on item_attachment(item_id, sort_order);
