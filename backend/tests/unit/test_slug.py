"""
Unit tests for slug generation functionality.
These tests don't require a database or any external dependencies.
"""
import pytest
from src.links.slug import slug_for_id, base62_encode, shuffle_64


class TestBase62Encode:
    """Test base62 encoding function."""
    
    def test_encode_zero(self):
        """Test encoding of zero."""
        assert base62_encode(0) == "0"
    
    def test_encode_small_numbers(self):
        """Test encoding of small numbers."""
        assert base62_encode(1) == "1"
        assert base62_encode(10) == "a"
        assert base62_encode(36) == "A"
        assert base62_encode(61) == "Z"
    
    def test_encode_larger_numbers(self):
        """Test encoding of larger numbers."""
        assert base62_encode(62) == "10"
        assert base62_encode(3844) == "100"  # 62^2
    
    def test_encode_negative_raises(self):
        """Test that negative numbers raise ValueError."""
        with pytest.raises(ValueError):
            base62_encode(-1)


class TestShuffle64:
    """Test the shuffle_64 function."""
    
    def test_shuffle_returns_int(self):
        """Test that shuffle returns an integer."""
        result = shuffle_64(12345)
        assert isinstance(result, int)
    
    def test_shuffle_same_input_same_output(self):
        """Test that shuffle is deterministic."""
        assert shuffle_64(12345) == shuffle_64(12345)
        assert shuffle_64(100) == shuffle_64(100)
    
    def test_shuffle_different_inputs(self):
        """Test that different inputs produce different outputs."""
        result1 = shuffle_64(1)
        result2 = shuffle_64(2)
        assert result1 != result2
    
    def test_shuffle_with_large_numbers(self):
        """Test shuffle with large numbers (64-bit masking)."""
        # Test that it handles large numbers correctly
        large_num = 2**63
        result = shuffle_64(large_num)
        assert isinstance(result, int)
        assert 0 <= result < 2**64


class TestSlugForId:
    """Test the main slug_for_id function."""
    
    def test_slug_for_id_basic(self):
        """Test basic slug generation."""
        slug = slug_for_id(1)
        assert isinstance(slug, str)
        assert len(slug) > 0
    
    def test_slug_for_id_deterministic(self):
        """Test that same ID produces same slug."""
        assert slug_for_id(1) == slug_for_id(1)
        assert slug_for_id(100) == slug_for_id(100)
        assert slug_for_id(9999) == slug_for_id(9999)
    
    def test_slug_for_id_different_ids(self):
        """Test that different IDs produce different slugs."""
        slug1 = slug_for_id(1)
        slug2 = slug_for_id(2)
        slug3 = slug_for_id(100)
        
        assert slug1 != slug2
        assert slug1 != slug3
        assert slug2 != slug3
    
    def test_slug_for_id_edge_cases(self):
        """Test edge cases for slug generation."""
        # Test with 0 (if it's a valid ID)
        slug_zero = slug_for_id(0)
        assert isinstance(slug_zero, str)
        
        # Test with large numbers
        slug_large = slug_for_id(999999999)
        assert isinstance(slug_large, str)
        assert len(slug_large) > 0
    
    def test_slug_for_id_max_length(self):
        """Test that slugs don't exceed expected maximum length."""
        # Base62 encoding of numbers in SPACE (62^7) should produce
        # slugs of length at most 7
        for test_id in [1, 10, 100, 1000, 10000, 100000, 1000000]:
            slug = slug_for_id(test_id)
            # Should be reasonable length (7 chars max for 62^7 space)
            assert len(slug) <= 7
    
    def test_slug_for_id_collision_resistance(self):
        """Test that sequential IDs produce different slugs (basic collision check)."""
        slugs = [slug_for_id(i) for i in range(1, 100)]
        # All slugs should be unique
        assert len(slugs) == len(set(slugs))

