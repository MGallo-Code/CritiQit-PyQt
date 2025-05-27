# utils/tmdb/movie_api.py

import logging
from urllib.parse import quote

logger = logging.getLogger(__name__)

class MovieAPI:
    """
    Handles TMDB API interactions specific to movies.
    """
    def __init__(self, tmdb_api_client):
        if not tmdb_api_client:
            raise ValueError("A TMDB API client instance is required for MovieAPI.")
        self.client = tmdb_api_client

    def get_search_movies(self, query, page=1):
        """
        Search for movies on TMDB.
        
        Args:
            query (str): The search query.
            page (int): The page number to retrieve.
            
        Returns:
            list: A list of movie results sorted by language, with selected language first.
        """
        endpoint = "search/movie"
        params = {
            "query": quote(query),
            "include_adult": "false",
            "page": page
        }
        response = self.client.get(endpoint, params=params)
        results = response.get('results', []) if response else []
        
        # Sort results by language, with selected language first
        target_lang = self.client.language.split('-')[0]
        return sorted(results, key=lambda x: (
            x.get('original_language', '') != target_lang,  # False (0) for target language comes first
            x.get('vote_average', 0) == 0,  # True (1) for unrated movies, putting them last
            -x.get('popularity', 0)  # Negative for descending order (higher popularity first)
        ))

    def get_movie_details(self, movie_id):
        """
        Get details for a specific movie.
        
        Args:
            movie_id (str or int): The TMDB ID of the movie.
            
        Returns:
            dict or None: Movie details as a dictionary, or None on error.
        """
        endpoint = f"movie/{movie_id}"
        return self.client.get(endpoint) 