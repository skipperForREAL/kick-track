import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';

interface Match {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string;
  intAwayScore: string;
  strStatus: string;
  strProgress: string;
  strLeague: string;
  strTime: string;
  strThumb?: string;
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
      // Using TheSportsDB API free endpoints
      const response = await fetch('https://www.thesportsdb.com/api/v1/json/3/latestsoccer.php');
      const data = await response.json();
      
      if (data.events) {
        // Filter for live matches (status contains "LIVE" or similar indicators)
        const live = data.events.filter((match: Match) => 
          match.strStatus?.toLowerCase().includes('live') || 
          match.strProgress !== null
        ).slice(0, 10); // Limit to 10 matches for better UX
        
        setLiveMatches(live);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching live matches:', error);
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

  const getStatusColor = (status: string) => {
    if (status?.toLowerCase().includes('live')) return 'match-live';
    if (status?.toLowerCase().includes('full') || status?.toLowerCase().includes('finished')) return 'match-finished';
    return 'match-upcoming';
  };

  const getStatusBadge = (match: Match) => {
    if (match.strProgress) {
      return (
        <Badge variant="outline" className="match-live pulse-glow border-match-live text-match-live">
          LIVE {match.strProgress}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className={getStatusColor(match.strStatus)}>
        {match.strStatus || 'Scheduled'}
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
              key={match.idEvent} 
              className="match-card fade-in cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onMatchSelect(match.idEvent)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">
                      {match.strLeague}
                    </div>
                    <div className="font-semibold text-foreground">
                      {match.strEvent}
                    </div>
                  </div>
                  {getStatusBadge(match)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center">
                    <div className="font-bold text-lg team-home">
                      {match.strHomeTeam}
                    </div>
                  </div>
                  
                  <div className="px-6">
                    <div className="text-2xl font-bold text-center">
                      <span className="team-home">{match.intHomeScore || '0'}</span>
                      <span className="text-muted-foreground mx-2">-</span>
                      <span className="team-away">{match.intAwayScore || '0'}</span>
                    </div>
                    {match.strTime && (
                      <div className="text-xs text-muted-foreground text-center mt-1">
                        {match.strTime}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center">
                    <div className="font-bold text-lg team-away">
                      {match.strAwayTeam}
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