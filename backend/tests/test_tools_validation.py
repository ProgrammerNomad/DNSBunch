import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.validation import normalize_dkim_selector


class TestDkimSelectorValidation:
    def test_valid_selector(self):
        assert normalize_dkim_selector("Google") == "google"
        assert normalize_dkim_selector("selector1") == "selector1"

    def test_empty_selector(self):
        with pytest.raises(ValueError, match="Selector is required"):
            normalize_dkim_selector("")

    def test_invalid_selector(self):
        with pytest.raises(ValueError, match="Invalid selector format"):
            normalize_dkim_selector("_bad")
        with pytest.raises(ValueError, match="Invalid selector format"):
            normalize_dkim_selector("bad space")
