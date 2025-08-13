import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';

interface Match {
  id: number;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
  };
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
  status: string;
  utcDate: string;
  competition: {
    id: number;
    name: string;
  };
  venue?: string;
}

interface LiveMatchesProps {
  onMatchSelect: (matchId: string) => void;
}

const LiveMatches: React.FC<LiveMatchesProps> = ({ onMatchSelect }) => {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchLiveMatches = async () => {
    try {
      setLoading(true);
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Use football-data.org API for current matches
      const response = await fetch(`https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${today}`, {
        headers: {
          'X-Auth-Token': import.meta.env.VITE_FOOTBALL_API_KEY || 'demo' // Free tier available
        }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.matches) {
        // Filter for live and recently finished matches, prioritize live ones
        const currentMatches = data.matches
          .filter((match: Match) => 
            match.status === 'IN_PLAY' || 
            match.status === 'PAUSED' || 
            match.status === 'FINISHED' ||
            match.status === 'LIVE'
          )
          .sort((a: Match, b: Match) => {
            // Prioritize live matches
            if (a.status === 'IN_PLAY' && b.status !== 'IN_PLAY') return -1;
            if (b.status === 'IN_PLAY' && a.status !== 'IN_PLAY') return 1;
            return 0;
          })
          .slice(0, 10);
        
        setLiveMatches(currentMatches);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching live matches:', error);
      // Fallback message for users
      setLiveMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMatches();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLiveMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (match: Match) => {
    if (match.status === 'IN_PLAY' || match.status === 'LIVE') {
      return (
        <Badge variant="outline" className="match-live pulse-glow border-match-live text-match-live">
          LIVE
        </Badge>
      );
    }
    if (match.status === 'PAUSED') {
      return (
        <Badge variant="outline" className="match-live border-match-live text-match-live">
          HALF TIME
        </Badge>
      );
    }
    if (match.status === 'FINISHED') {
      return (
        <Badge variant="outline" className="text-match-finished">
          FINISHED
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-match-upcoming">
        {match.status}
      </Badge>
    );
  };

  if (loading && liveMatches.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold gradient-text">Live Matches</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="match-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 slide-up">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold gradient-text">Live Matches</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {liveMatches.length === 0 ? (
        <Card className="match-card">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Live Matches</h3>
            <p className="text-muted-foreground">Check back later for live football action!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {liveMatches.map((match, index) => (
            <Card 
              key={match.id} 
              className="match-card fade-in cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onMatchSelect(match.id.toString())}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">
                      {match.competition.name}
                    </div>
                    <div className="font-semibold text-foreground">
                      {match.homeTeam.name} vs {match.awayTeam.name}
                    </div>
                  </div>
                  {getStatusBadge(match)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center">
                    <div className="font-bold text-lg team-home">
                      {match.homeTeam.shortName || match.homeTeam.name}
                    </div>
                  </div>
                  
                  <div className="px-6">
                    <div className="text-2xl font-bold text-center">
                      <span className="team-home">{match.score.fullTime.home ?? '-'}</span>
                      <span className="text-muted-foreground mx-2">-</span>
                      <span className="team-away">{match.score.fullTime.away ?? '-'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground text-center mt-1">
                      {new Date(match.utcDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </div>
                  </div>

                  <div className="flex-1 text-center">
                    <div className="font-bold text-lg team-away">
                      {match.awayTeam.shortName || match.awayTeam.name}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveMatches;