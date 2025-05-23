# gui/MainContent/ResultsPage.py
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QScrollArea, QHBoxLayout,
    QFrame
)
from PySide6.QtCore import QSize, Qt
from PySide6.QtGui import QFont

from gui.Pages.BasePage import BasePage
from gui.Pages.MovieDetailsPage import MovieDetailsPage
from gui.Pages.ShowDetailsPage import ShowDetailsPage
from gui.CustomWidgets.ImageWidgets import ImageButton

class ResultItemWidget(QFrame):
    """A custom widget to display a single search result item"""
    def __init__(self, result, is_movie, on_click):
        super().__init__()
        self.setFrameStyle(QFrame.StyledPanel | QFrame.Raised)
        self.setStyleSheet("""
            QFrame {
                background-color: white;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            QFrame:hover {
                background-color: #f8f8f8;
                border: 1px solid #ccc;
            }
        """)
        
        # Main layout
        layout = QHBoxLayout(self)
        layout.setContentsMargins(8, 8, 8, 8)
        layout.setSpacing(12)

        # Create button with image support
        btn = ImageButton("", default_width=60, default_height=90)
        btn.clicked.connect(on_click)
        btn.setStyleSheet("""
            QPushButton {
                border: none;
                background: transparent;
            }
            QPushButton:hover {
                background: transparent;
            }
        """)
        
        # Set the poster image if available
        poster_path = result.get('poster_path')
        poster_url = None
        if poster_path:
            poster_url = f"https://image.tmdb.org/t/p/w154{poster_path}"
        btn.set_image(poster_url, size=(60, 90))

        # Right side content
        content_widget = QWidget()
        content_layout = QVBoxLayout(content_widget)
        content_layout.setContentsMargins(0, 0, 0, 0)
        content_layout.setSpacing(4)

        # Title and date
        if is_movie:
            title = result.get('title', 'Unknown Title')
            date = result.get('release_date', 'Unknown Date')
        else:
            title = result.get('name', 'Unknown Name')
            date = result.get('first_air_date', 'Unknown Date')

        title_label = QLabel(f"<b>{title}</b> ({date})")
        title_label.setStyleSheet("font-size: 14px;")
        content_layout.addWidget(title_label)

        # Overview/description
        overview = result.get('overview', '')
        if overview:
            overview_label = QLabel(overview)
            overview_label.setWordWrap(True)
            overview_label.setStyleSheet("""
                QLabel {
                    color: #666;
                    font-size: 12px;
                }
            """)
            # Limit to 2 lines
            overview_label.setMaximumHeight(overview_label.fontMetrics().lineSpacing() * 2)
            content_layout.addWidget(overview_label)

        # Additional info
        info_widget = QWidget()
        info_layout = QHBoxLayout(info_widget)
        info_layout.setContentsMargins(0, 0, 0, 0)
        info_layout.setSpacing(8)

        # Rating
        vote_average = result.get('vote_average', 0)
        if vote_average:
            rating_label = QLabel(f"★ {vote_average:.1f}")
            rating_label.setStyleSheet("color: #f5c518; font-weight: bold;")
            info_layout.addWidget(rating_label)

        # Language
        language = result.get('original_language', '').upper()
        if language:
            lang_label = QLabel(f"Language: {language}")
            lang_label.setStyleSheet("color: #666;")
            info_layout.addWidget(lang_label)

        info_layout.addStretch()
        content_layout.addWidget(info_widget)
        content_layout.addStretch()

        # Add widgets to main layout
        layout.addWidget(btn)
        layout.addWidget(content_widget, 1)  # Give content widget stretch factor 1

class ResultsPage(BasePage):
    def __init__(self, navigation_controller, api_manager, rating_manager, results, is_movie):
        super().__init__()
        self.nav = navigation_controller
        self.api_manager = api_manager
        self.rating_manager = rating_manager
        self.results = results
        self.is_movie = is_movie

        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(16)

        # Header
        header = QLabel("<h2>Search Results:</h2>")
        header.setStyleSheet("margin-bottom: 8px;")
        layout.addWidget(header)

        # Results area
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: transparent;
            }
        """)
        
        scroll_content = QWidget()
        self.results_layout = QVBoxLayout(scroll_content)
        self.results_layout.setContentsMargins(0, 0, 0, 0)
        self.results_layout.setSpacing(8)

        # Build the UI for each result
        for result in self.results:
            if self.is_movie:
                item = ResultItemWidget(result, True, lambda r=result: self.show_movie_details(r))
            else:
                item = ResultItemWidget(result, False, lambda r=result: self.show_tv_details(r))
            self.results_layout.addWidget(item)

        self.results_layout.addStretch()
        scroll_content.setLayout(self.results_layout)
        scroll_area.setWidget(scroll_content)
        layout.addWidget(scroll_area)

    def show_movie_details(self, movie):
        page = MovieDetailsPage(self.nav, self.api_manager, self.rating_manager, movie)
        self.nav.push(page)

    def show_tv_details(self, tv_show):
        show_id = "tv:" + str(tv_show.get('id'))
        detailed_show = self.api_manager.get_content_details(show_id)
        page = ShowDetailsPage(self.nav, self.api_manager, self.rating_manager, detailed_show)
        self.nav.push(page)