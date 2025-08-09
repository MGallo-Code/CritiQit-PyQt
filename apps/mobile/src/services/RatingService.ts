import { getDatabase, runInTransaction } from '../db/sqlite';
import { clampScoreOptional, CreateMovieRatingInput, MovieRatingRecord, UpdateMovieRatingInput } from '../models/Rating';

async function upsertTags(db: any, names: string[] = []): Promise<number[]> {
  if (!names.length) return [];
  const unique = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  const ids: number[] = [];
  for (const name of unique) {
    try {
      const res = await db.runAsync('INSERT INTO tags(name) VALUES (?)', name);
      ids.push(res.lastInsertRowId as number);
    } catch (e) {
      // likely UNIQUE constraint -> fetch id
      const row = await db.getFirstAsync('SELECT id FROM tags WHERE name = ?', name);
      if (row) ids.push(row.id as number);
    }
  }
  return ids;
}

async function setRatingTags(db: any, ratingId: number, tagIds: number[]) {
      await db.runAsync('DELETE FROM movie_rating_tags WHERE rating_id = ?', ratingId);
      for (const tagId of tagIds) {
        await db.runAsync('INSERT OR IGNORE INTO movie_rating_tags(rating_id, tag_id) VALUES (?, ?)', ratingId, tagId);
      }
}

export const RatingService = {
  async create(input: CreateMovieRatingInput): Promise<MovieRatingRecord> {
    const now = Date.now();
    const oneScore = clampScoreOptional(input.oneScore);
    const watched = input.watchedCount && input.watchedCount > 0 ? input.watchedCount : 1;
    return runInTransaction(async (db) => {
      // upsert movie by (external_source, external_id) if provided, else by (title, year)
      let movieRow = null as any;
      if (input.externalSource && input.externalId) {
        movieRow = await db.getFirstAsync(
          'SELECT * FROM movies WHERE external_source = ? AND external_id = ?',
          input.externalSource,
          input.externalId
        );
      }
      if (!movieRow) {
        const ins = await db.runAsync(
          'INSERT INTO movies(title, year, external_source, external_id) VALUES (?, ?, ?, ?)',
          input.title,
          input.year ?? null,
          input.externalSource ?? null,
          input.externalId ?? null
        );
        movieRow = { id: ins.lastInsertRowId, title: input.title, year: input.year ?? null, external_source: input.externalSource ?? null, external_id: input.externalId ?? null };
      }

      // upsert rating for local user
      const existing = await db.getFirstAsync('SELECT * FROM movie_ratings WHERE movie_id = ? AND user_id = ?', movieRow.id, 'local');
      let ratingId: number;
      if (existing) {
        throw new Error('Movie rating already exists for this user');
      } else {
        const r = await db.runAsync(
          'INSERT INTO movie_ratings(movie_id, user_id, one_score, text_review, watched_count, rated_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          movieRow.id,
          'local',
          oneScore ?? null,
          input.textReview ?? null,
          watched,
          now,
          now
        );
        ratingId = r.lastInsertRowId as number;
      }

      const tagIds = await upsertTags(db, input.tags);
      await setRatingTags(db, ratingId, tagIds);

      return this.getById(ratingId);
    });
  },

  async update(input: UpdateMovieRatingInput): Promise<MovieRatingRecord> {
    const db = await getDatabase();
    const fields: string[] = [];
    const params: any[] = [];
    if (input.oneScore !== undefined) { fields.push('one_score = ?'); params.push(clampScoreOptional(input.oneScore)); }
    if (input.textReview !== undefined) { fields.push('text_review = ?'); params.push(input.textReview); }
    if (input.watchedCount !== undefined) { fields.push('watched_count = ?'); params.push(input.watchedCount); }
    fields.push('updated_at = ?'); params.push(Date.now());
    params.push(input.id);
    await db.runAsync(`UPDATE movie_ratings SET ${fields.join(', ')} WHERE id = ?`, ...params);

    if (input.tags) {
      const tagIds = await upsertTags(db, input.tags);
      await setRatingTags(db, input.id, tagIds);
    }
    return this.getById(input.id);
  },

  async getById(id: number): Promise<MovieRatingRecord> {
    const db = await getDatabase();
    const row = await db.getFirstAsync('SELECT mr.*, m.title as m_title, m.year as m_year, m.external_source as m_source, m.external_id as m_ext_id FROM movie_ratings mr INNER JOIN movies m ON m.id = mr.movie_id WHERE mr.id = ?', id);
    if (!row) throw new Error('Rating not found');
    const tags = await db.getAllAsync(`SELECT t.name FROM tags t INNER JOIN movie_rating_tags rt ON rt.tag_id = t.id WHERE rt.rating_id = ? ORDER BY t.name`, id);
    return {
      id: row.id,
      movie: {
        id: row.movie_id,
        title: row.m_title,
        year: row.m_year ?? null,
        externalSource: row.m_source ?? null,
        externalId: row.m_ext_id ?? null,
      },
      oneScore: row.one_score,
      textReview: row.text_review ?? null,
      watchedCount: row.watched_count,
      ratedAt: row.rated_at,
      updatedAt: row.updated_at,
      tags: tags.map((t: any) => t.name as string),
    };
  },

  async listAll(): Promise<MovieRatingRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync('SELECT mr.*, m.title as m_title, m.year as m_year, m.external_source as m_source, m.external_id as m_ext_id FROM movie_ratings mr INNER JOIN movies m ON m.id = mr.movie_id ORDER BY mr.rated_at DESC');
    const result: MovieRatingRecord[] = [];
    for (const row of rows) {
      const tags = await db.getAllAsync(`SELECT t.name FROM tags t INNER JOIN movie_rating_tags rt ON rt.tag_id = t.id WHERE rt.rating_id = ? ORDER BY t.name`, row.id);
      result.push({
        id: row.id,
        movie: {
          id: row.movie_id,
          title: row.m_title,
          year: row.m_year ?? null,
          externalSource: row.m_source ?? null,
          externalId: row.m_ext_id ?? null,
        },
        oneScore: row.one_score,
        textReview: row.text_review ?? null,
        watchedCount: row.watched_count,
        ratedAt: row.rated_at,
        updatedAt: row.updated_at,
        tags: tags.map((t: any) => t.name as string),
      });
    }
    return result;
  },

  async remove(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM movie_ratings WHERE id = ?', id);
  },
};


