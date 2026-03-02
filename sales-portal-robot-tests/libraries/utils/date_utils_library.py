"""RF keyword library for date formatting and arithmetic (Phase 4)."""

from __future__ import annotations

from datetime import datetime, timedelta

from robot.api.deco import keyword, library


@library(scope="GLOBAL")
class DateUtilsLibrary:
    """Keywords for date formatting, parsing, and comparison.

    The backend uses ``YYYY/MM/DD`` as its canonical date string format.
    All keywords in this library default to that convention unless stated otherwise.
    """

    _BACKEND_FORMAT = "%Y/%m/%d"
    _ISO_FORMAT = "%Y-%m-%d"

    # ------------------------------------------------------------------
    # Public RF keywords
    # ------------------------------------------------------------------

    @keyword("Format Date For API")
    def format_date_for_api(
        self,
        date: datetime | None = None,
        days_offset: int = 7,
    ) -> str:
        """Return a date string in ``YYYY/MM/DD`` format (backend convention).

        Args:
            date: A ``datetime`` object to format.  When ``None`` (default)
                  today's date is used, offset by ``days_offset``.
            days_offset: Number of days to add to *today* when ``date`` is not
                         provided.  Defaults to 7.

        Returns:
            A string like ``"2026/03/07"``.

        Examples:
            | ${date}=    Format Date For API                    | # today + 7 days  |
            | ${date}=    Format Date For API    days_offset=14  | # today + 14 days |
        """
        target = date if date is not None else (datetime.now() + timedelta(days=int(days_offset)))
        return target.strftime(self._BACKEND_FORMAT)

    @keyword("Parse API Date")
    def parse_api_date(self, date_string: str) -> datetime:
        """Parse a backend date string (``YYYY/MM/DD``) into a ``datetime`` object.

        Args:
            date_string: A date string in ``YYYY/MM/DD`` format.

        Returns:
            A ``datetime`` object with time components set to zero.

        Raises:
            ``ValueError``: If *date_string* does not match ``YYYY/MM/DD``.
        """
        return datetime.strptime(date_string, self._BACKEND_FORMAT)

    @keyword("Get Current Date String")
    def get_current_date_string(self, days_offset: int = 0) -> str:
        """Return today's date (optionally offset) as a ``YYYY/MM/DD`` string.

        Args:
            days_offset: Number of days to add (positive) or subtract (negative)
                         from today.  Defaults to 0 (today).

        Returns:
            A string like ``"2026/02/28"``.
        """
        target = datetime.now() + timedelta(days=int(days_offset))
        return target.strftime(self._BACKEND_FORMAT)

    @keyword("Date Is In The Future")
    def date_is_in_the_future(self, date_string: str) -> bool:
        """Return ``True`` if *date_string* (``YYYY/MM/DD``) is strictly after today.

        Args:
            date_string: A date string in ``YYYY/MM/DD`` format.

        Returns:
            ``True`` if the date is in the future, ``False`` otherwise.
        """
        parsed = datetime.strptime(date_string, self._BACKEND_FORMAT)
        return parsed.date() > datetime.now().date()
