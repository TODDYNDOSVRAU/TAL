-- Local database for the clone. SQLite via Room. Times are epoch milliseconds in UTC.
-- The app has one user and the file is private to the app, so there are no owner columns.

create table artist (
  id integer primary key autoincrement,
  name text not null,
  name_key text not null,              -- lowercase, accents removed, for search and sort
  image_uri text,
  created_at integer not null,
  updated_at integer not null
);
create unique index idx_artist_key on artist (name_key);

create table album (
  id integer primary key autoincrement,
  artist_id integer references artist(id) on delete set null,
  title text not null,
  title_key text not null,
  year integer,
  disc_count integer not null default 1 check (disc_count >= 1),
  cover_uri text,
  created_at integer not null,
  updated_at integer not null
);
create index idx_album_artist on album (artist_id);
create index idx_album_title_key on album (title_key);

create table track (
  id integer primary key autoincrement,
  source text not null check (source in ('device', 'audius', 'jamendo')),
  source_key text not null,            -- MediaStore id or the service's track id
  album_id integer references album(id) on delete cascade,
  artist_id integer references artist(id) on delete set null,
  title text not null,
  title_key text not null,
  track_no integer,
  disc_no integer not null default 1,
  duration_ms integer not null check (duration_ms >= 0),
  uri text not null,
  mime_type text,
  encoder_delay integer,               -- gapless trim, samples
  encoder_padding integer,
  loudness_lufs real,                  -- integrated loudness, null until known
  replaygain_db real,
  start_ms integer,                    -- optional custom range
  end_ms integer,
  added_at integer not null,
  updated_at integer not null,
  check (end_ms is null or start_ms is null or end_ms > start_ms)
);
create unique index idx_track_source on track (source, source_key);
create index idx_track_album on track (album_id, disc_no, track_no);
create index idx_track_artist on track (artist_id);
create index idx_track_title_key on track (title_key);
create index idx_track_added on track (added_at);

create table playlist (
  id integer primary key autoincrement,
  name text not null,
  name_key text not null,
  created_at integer not null,
  updated_at integer not null
);
create unique index idx_playlist_name on playlist (name_key);

create table playlist_item (
  playlist_id integer not null references playlist(id) on delete cascade,
  track_id integer not null references track(id) on delete cascade,
  position integer not null check (position >= 0),
  added_at integer not null,
  primary key (playlist_id, position)
);
create index idx_playlist_item_track on playlist_item (track_id);

create table queue_item (
  position integer primary key check (position >= 0),
  track_id integer not null references track(id) on delete cascade,
  origin text not null default 'user' check (origin in ('user', 'autoplay')),
  original_position integer not null    -- restores the order when shuffle goes off
);
create index idx_queue_track on queue_item (track_id);

create table play_event (
  id integer primary key autoincrement,
  track_id integer not null,            -- no foreign key: history outlives the track row
  played_at integer not null,
  played_ms integer not null check (played_ms >= 0),
  skipped integer not null default 0 check (skipped in (0, 1))
);
create index idx_play_event_track on play_event (track_id, played_at);
create index idx_play_event_time on play_event (played_at);

create table lyric_line (
  track_id integer not null references track(id) on delete cascade,
  idx integer not null,
  start_ms integer,                     -- null for plain, unsynced text
  end_ms integer,
  text text not null,
  speaker text,
  background integer not null default 0 check (background in (0, 1)),
  words_json text,                      -- optional [{start_ms,end_ms,text}] for word timing
  primary key (track_id, idx)
);

create table download (
  track_id integer primary key references track(id) on delete cascade,
  state text not null default 'idle'
    check (state in ('idle', 'prepared', 'downloading', 'downloaded', 'paused')),
  bytes_total integer,
  bytes_done integer not null default 0,
  failures integer not null default 0,
  updated_at integer not null
);

create table setting_override (          -- per-track engine overrides (e.g. EQ preset)
  track_id integer not null references track(id) on delete cascade,
  key text not null,
  value text not null,
  primary key (track_id, key)
);
