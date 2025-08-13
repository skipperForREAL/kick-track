import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Trophy } from 'lucide-react';

interface Match {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore?: string;
  intAwayScore?: string;
  strStatus: string;
  strProgress?: string;
  strLeague: string;
  strTime: string;
  dateEvent: string;
}

interface GroupedMatches {
  [league: string]: Match[];
}

interface TodayMatchesProps {
  onMatchSelect: (matchId: string) => void;
}

const TodayMatches: React.FC<TodayMatchesProps> = ({ onMatchSelect }) => {
  const [todayMatches, setTodayMatches] = useState<GroupedMatches>({});
  const [loading, setLoading] = useState(true);

  const fetchTodayMatches = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      
      // Fetch matches for today using TheSportsDB API
      const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${dateStr}&s=Soccer`);
      const data = await response.json();
      
      if (data.events) {
        // Group matches by league
        const grouped = data.events.reduce((acc: GroupedMatches, match: Match) => {
          const league = match.strLeague || 'Other';
          if (!acc[league]) {
            acc[league] = [];
          }
          acc[league].push(match);
          return acc;
        }, {});
        
        // Sort matches within each league by time
        Object.keys(grouped).forEach(league => {
          grouped[league].sort((a, b) => {
            const timeA = a.strTime || '00:00:00';
            const timeB = b.strTime || '00:00:00';
            return timeA.localeCompare(timeB);
          });
        });
        
        setTodayMatches(grouped);
      }
    } catch (error) {
      console.error('Error fetching today matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayMatches();
  }, []);

  const getStatusColor = (match: Match) => {
    if (match.strProgress) return 'match-live';
    if (match.strStatus?.toLowerCase().includes('full') || match.strStatus?.toLowerCase().includes('finished')) return 'match-finished';
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
    
    if (match.strStatus?.toLowerCase().includes('full') || match.strStatus?.toLowerCase().includes('finished')) {
      return (
        <Badge variant="outline" className="text-match-finished">
          FT
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-match-upcoming">
        {match.strTime?.substring(0, 5) || 'TBD'}
      </Badge>
    );
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold gradient-text">Today's Matches</h2>
        </div>
        
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="match-card animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map(j => (
                    <div key={j} className="h-16 bg-muted rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const leagues = Object.keys(todayMatches);

  return (
    <div className="space-y-6 slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold gradient-text">Today's Matches</h2>
            <p className="text-muted-foreground">{formatDate()}</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {Object.values(todayMatches).flat().length} matches
        </Badge>
      </div>

      {leagues.length === 0 ? (
        <Card className="match-card">
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Matches Today</h3>
            <p className="text-muted-foreground">Check back tomorrow for more football action!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {leagues.map((league, leagueIndex) => (
            <Card key={league} className="match-card fade-in" style={{ animationDelay: `${leagueIndex * 0.1}s` }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  {league}
                  <Badge variant="outline" className="ml-auto">
                    {todayMatches[league].length} matches
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayMatches[league].map((match, matchIndex) => (
                    <div
                      key={match.idEvent}
                      className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onMatchSelect(match.idEvent)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {match.strTime?.substring(0, 5) || 'TBD'}
                        </div>
                        {getStatusBadge(match)}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold team-home text-sm mb-1">
                            {match.strHomeTeam}
                          </div>
                          <div className="font-semibold team-away text-sm">
                            {match.strAwayTeam}
                          </div>
                        </div>

                        {(match.intHomeScore !== undefined && match.intAwayScore !== undefined) ? (
                          <div className="text-right">
                            <div className="font-bold text-sm">
                              <span className="team-home">{match.intHomeScore}</span>
                            </div>
                            <div className="font-bold text-sm">
                              <span className="team-away">{match.intAwayScore}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center px-4">
                            <div className="text-2xl font-light text-muted-foreground">vs</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayMatches;