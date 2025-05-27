import json
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class UserPreferences:
    """Manages user preferences with persistence to a JSON file"""
    
    DEFAULT_PREFS = {
        "language": "en-US",  # Default language code
        "language_display": "English (US)",  # Display name for UI
        "content_type": "movie",  # Default content type (movie/tv)
        "content_type_display": "Movie"  # Display name for UI
    }
    
    def __init__(self):
        self.preferences_file = "data/user_preferences.json"
        self.preferences = self._load_preferences()
    
    def _load_preferences(self):
        """Load preferences from file or create default if not exists."""
        try:
            if os.path.exists(self.preferences_file):
                with open(self.preferences_file, 'r') as f:
                    return json.load(f)
            else:
                # Create default preferences
                default_prefs = {
                    "default_language": "en-US",
                    "available_languages": [
                        "en-US", "es-ES", "fr-FR", "de-DE", "it-IT",
                        "pt-BR", "ru-RU", "ja-JP", "ko-KR", "zh-CN"
                    ]
                }
                # Ensure directory exists
                os.makedirs(os.path.dirname(self.preferences_file), exist_ok=True)
                # Save default preferences
                with open(self.preferences_file, 'w') as f:
                    json.dump(default_prefs, f, indent=4)
                return default_prefs
        except Exception as e:
            logger.error(f"Error loading preferences: {e}")
            return {
                "default_language": "en-US",
                "available_languages": ["en-US"]
            }
    
    def get_default_language(self):
        """Get the default language setting."""
        return self.preferences.get("default_language", "en-US")
    
    def get_available_languages(self):
        """Get list of available languages."""
        return self.preferences.get("available_languages", ["en-US"])
    
    def save_preferences(self):
        """Save current preferences to file."""
        try:
            with open(self.preferences_file, 'w') as f:
                json.dump(self.preferences, f, indent=4)
        except Exception as e:
            logger.error(f"Error saving preferences: {e}")
    
    def update_preference(self, key, value):
        """Update a specific preference."""
        self.preferences[key] = value
        self.save_preferences()
    
    def get(self, key, default=None):
        """Get a preference value"""
        return self.preferences.get(key, default)
    
    def set(self, key, value):
        """Set a preference value and save to file"""
        self.preferences[key] = value
        self.save_preferences()
    
    def get_language_code(self):
        """Get the current language code"""
        return self.get("language", self.DEFAULT_PREFS["language"])
    
    def get_language_display(self):
        """Get the current language display name"""
        return self.get("language_display", self.DEFAULT_PREFS["language_display"])
    
    def get_content_type(self):
        """Get the current content type"""
        return self.get("content_type", self.DEFAULT_PREFS["content_type"])
    
    def get_content_type_display(self):
        """Get the current content type display name"""
        return self.get("content_type_display", self.DEFAULT_PREFS["content_type_display"]) 