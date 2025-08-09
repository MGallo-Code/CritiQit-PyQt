import { RatingService } from '../../src/services/RatingService';
import * as db from '../../src/db/sqlite';

jest.mock('../../src/db/sqlite');

describe('RatingService (movie)', () => {
  let runInTransactionMock: jest.SpyInstance;
  let getDatabaseMock: jest.SpyInstance;
  let dbConn: any;

  beforeEach(() => {
    dbConn = {
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(),
      withTransactionAsync: jest.fn((fn: any) => fn()),
    };
    (db as any).getDatabase = jest.fn(async () => dbConn);
    (db as any).runInTransaction = jest.fn(async (fn: any) => fn(dbConn));
  });

  test('create inserts movie and rating, returns record', async () => {
    // movie not found → insert
    dbConn.getFirstAsync.mockResolvedValueOnce(null); // external lookup
    dbConn.runAsync.mockResolvedValueOnce({ lastInsertRowId: 1 }); // insert movie

    // rating not found → insert
    dbConn.getFirstAsync.mockResolvedValueOnce(null); // existing rating
    dbConn.runAsync.mockResolvedValueOnce({ lastInsertRowId: 10 }); // insert rating

    // tags flow
    dbConn.runAsync.mockResolvedValueOnce({ lastInsertRowId: 100 }); // insert tag
    dbConn.runAsync.mockResolvedValueOnce({}); // set rating tag

    // getById
    dbConn.getFirstAsync.mockResolvedValueOnce({
      id: 10,
      movie_id: 1,
      m_title: 'Inception',
      m_year: 2010,
      m_source: 'tmdb',
      m_ext_id: '123',
      one_score: 9500,
      text_review: 'Great',
      watched_count: 1,
      rated_at: 1,
      updated_at: 1,
    });
    dbConn.getAllAsync.mockResolvedValueOnce([{ name: 'sci-fi' }]);

    const record = await RatingService.create({
      title: 'Inception',
      year: 2010,
      externalSource: 'tmdb',
      externalId: '123',
      oneScore: 9500,
      textReview: 'Great',
      tags: ['sci-fi'],
    });

    expect(record.movie.title).toBe('Inception');
    expect(record.oneScore).toBe(9500);
    expect(record.tags).toEqual(['sci-fi']);
  });

  test('create throws when duplicate rating exists', async () => {
    // movie found (by external id)
    dbConn.getFirstAsync.mockResolvedValueOnce({ id: 1 });
    // rating exists
    dbConn.getFirstAsync.mockResolvedValueOnce({ id: 10 });
    await expect(
      RatingService.create({ title: 'Inception', externalSource: 'tmdb', externalId: 'x', oneScore: 9000 })
    ).rejects.toThrow('Movie rating already exists for this user');
  });
});


