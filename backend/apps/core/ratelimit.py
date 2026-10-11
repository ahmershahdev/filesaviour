"""Fixed-window rate limiting on the default cache (LocMem in dev, Redis in prod)."""

from django.core.cache import cache


def client_ip(request) -> str:
    # Caddy appends the real peer to X-Forwarded-For; earlier entries are client-supplied.
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    return forwarded.split(",")[-1].strip() if forwarded else request.META.get("REMOTE_ADDR", "")


def limited(request, scope: str, *, limit: int, window: int) -> bool:
    """Count one attempt for this client; True once it exceeds `limit` per `window` seconds."""
    key = f"rl:{scope}:{client_ip(request)}"
    cache.add(key, 0, window)
    try:
        return cache.incr(key) > limit
    except ValueError:  # expired between add() and incr()
        cache.set(key, 1, window)
        return False
