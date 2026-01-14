from abc import ABC, abstractmethod
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List

class RateLimiterStrategy(ABC):
    """
    Abstract Base Class voor Rate Limiting strategieën.
    Dit maakt het mogelijk om later eenvoudig te wisselen naar bijv. Redis.
    """
    
    @abstractmethod
    def check_limit(self, key: str) -> bool:
        """
        Controleert of de limiet voor de gegeven key is bereikt.
        Returns:
            True als het request is toegestaan.
            False als de limiet is bereikt.
        """
        pass

class InMemoryRateLimiter(RateLimiterStrategy):
    """
    In-memory implementatie van rate limiting.
    Niet persistent (reset bij herstart) en niet geschikt voor geschaalde environments.
    """
    
    def __init__(self, limit: int, window_seconds: int = 86400): # Default 24 uur
        self.limit = limit
        self.window = timedelta(seconds=window_seconds)
        self.usage: Dict[str, List[datetime]] = defaultdict(list)
    
    def check_limit(self, key: str) -> bool:
        now = datetime.now()
        
        # Schoon oude entries op (lazy cleanup)
        # We houden alleen timestamps binnen het window
        self.usage[key] = [t for t in self.usage[key] if t > now - self.window]
        
        if len(self.usage[key]) >= self.limit:
            return False
            
        self.usage[key].append(now)
        return True
