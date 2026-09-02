alter table book_details rename column isbn to isbn13;
alter table book_details add column isbn10 text;
alter table book_details add column format text;

alter table film_details add column format text;
alter table film_details add column actors text;

alter table music_album_details add column format text;
alter table music_album_details add column ean text;
alter table music_album_details add column upc text;
