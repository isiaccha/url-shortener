from __future__ import annotations

_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
_BASE = len(_ALPHABET)
_MASK_64 = (1 << 64) - 1

# Keep these stable once you ship. MULT must be odd.
MULT = 11400714819323198485
XOR_SECRET = 0xA5A5A5A5A5A5A5A5


def shuffle_64(x: int) -> int:
    x &= _MASK_64
    x = (x * MULT) & _MASK_64
    x ^= XOR_SECRET
    return x & _MASK_64


def base62_encode(n: int) -> str:
    if n < 0:
        raise ValueError("n must be non-negative")
    if n == 0:
        return _ALPHABET[0]

    out: list[str] = []
    while n:
        n, rem = divmod(n, _BASE)
        out.append(_ALPHABET[rem])
    return "".join(reversed(out))


SPACE = 62 ** 7

def slug_for_id(id_value: int) -> str:
    shuffled = shuffle_64(id_value)
    bounded = shuffled % SPACE
    return base62_encode(bounded)

