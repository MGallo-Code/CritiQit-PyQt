import * as SQLite from 'expo-sqlite';

export type DatabaseConnection = SQLite.SQLiteDatabase;

let dbInstance: DatabaseConnection | null = null;

export async function getDatabase(): Promise<DatabaseConnection> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('critiqit.db');
    await dbInstance.execAsync(`
      PRAGMA journal_mode = WAL;

      -- Movies catalog (deduplicated across users)
      CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        year INTEGER,
        external_source TEXT,
        external_id TEXT,
        UNIQUE(external_source, external_id)
      );
      CREATE INDEX IF NOT EXISTS idx_movies_title_year ON movies(title, year);

      -- Movie ratings (one per user per movie for now; user_id is 'local')
      CREATE TABLE IF NOT EXISTS movie_ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movie_id INTEGER NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'local',
        one_score INTEGER,
        text_review TEXT,
        watched_count INTEGER NOT NULL DEFAULT 1,
        rated_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY(movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        UNIQUE(user_id, movie_id)
      );
      CREATE INDEX IF NOT EXISTS idx_movie_ratings_movie ON movie_ratings(movie_id);

      -- Tags and join for movie ratings
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );
      CREATE TABLE IF NOT EXISTS movie_rating_tags (
        rating_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (rating_id, tag_id),
        FOREIGN KEY (rating_id) REFERENCES movie_ratings(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );
    `);
  }
  return dbInstance;
}

export async function runInTransaction<T>(fn: (db: DatabaseConnection) => Promise<T>): Promise<T> {
  const db = await getDatabase();
  return db.withTransactionAsync(async () => fn(db));
}


