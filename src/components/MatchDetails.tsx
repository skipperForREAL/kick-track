import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Clock, Users, Target, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MatchEvent {
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
  strVenue: string;
  strDescriptionEN?: string;
  strHomeFormation?: string;
  strAwayFormation?: string;
  strHomeLineupGoalkeeper?: string;
  strAwayLineupGoalkeeper?: string;
  strHomeLineupDefense?: string;
  strAwayLineupDefense?: string;
  strHomeLineupMidfield?: string;
  strAwayLineupMidfield?: string;
  strHomeLineupForward?: string;
  strAwayLineupForward?: string;
  strHomeLineupSubstitutes?: string;
  strAwayLineupSubstitutes?: string;
}

interface MatchDetailsProps {
  matchId: string;
  onBack: () => void;
}

const MatchDetails: React.FC<MatchDetailsProps> = ({ matchId, onBack }) => {
  const [match, setMatch] = useState<MatchEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/lookupevent.php?id=${matchId}`);
      const data = await response.json();
      
      if (data.events && data.events.length > 0) {
        setMatch(data.events[0]);
      }
    } catch (error) {
      console.error('Error fetching match details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) {
      fetchMatchDetails();
    }
  }, [matchId]);

  const parseLineup = (lineup: string | undefined) => {
    if (!lineup) return [];
    return lineup.split(';').filter(player => player.trim());
  };

  const getStatusBadge = (match: MatchEvent) => {
    if (match.strProgress) {
      return (
        <Badge variant="outline" className="match-live pulse-glow border-match-live text-match-live">
          LIVE {match.strProgress}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-match-finished">
        {match.strStatus || 'Scheduled'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Live Matches
        </Button>
        <Card className="match-card animate-pulse">
          <CardContent className="p-8">
            <div className="h-8 bg-muted rounded w-3/4 mb-6"></div>
            <div className="h-16 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Live Matches
        </Button>
        <Card className="match-card">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Match Not Found</h3>
            <p className="text-muted-foreground">Unable to load match details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 slide-up">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Live Matches
      </Button>

      {/* Match Header */}
      <Card className="match-card">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                {match.strLeague}
              </div>
              <CardTitle className="text-2xl gradient-text">
                {match.strEvent}
              </CardTitle>
            </div>
            {getStatusBadge(match)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Home Team */}
            <div className="text-center">
              <h3 className="text-2xl font-bold team-home mb-2">
                {match.strHomeTeam}
              </h3>
              <div className="text-4xl font-bold team-home">
                {match.intHomeScore || '0'}
              </div>
            </div>

            {/* Match Info */}
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">VS</div>
              {match.strTime && (
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {match.strTime}
                </div>
              )}
              {match.strVenue && (
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {match.strVenue}
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center">
              <h3 className="text-2xl font-bold team-away mb-2">
                {match.strAwayTeam}
              </h3>
              <div className="text-4xl font-bold team-away">
                {match.intAwayScore || '0'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Details Tabs */}
      <Tabs defaultValue="lineups" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lineups">Lineups</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="lineups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Home Team Lineup */}
            <Card className="match-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 team-home">
                  <Users className="h-5 w-5" />
                  {match.strHomeTeam}
                  {match.strHomeFormation && (
                    <Badge variant="secondary">{match.strHomeFormation}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {match.strHomeLineupGoalkeeper && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Goalkeeper</h4>
                    <div className="space-y-1">
                      {parseLineup(match.strHomeLineupGoalkeeper).map((player, idx) => (
                        <div key={idx} className="text-sm p-2 rounded bg-muted/50">
                          {player}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {match.strHomeLineupDefense && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Defense</h4>
                    <div className="space-y-1">
                      {parseLineup(match.strHomeLineupDefense).map((player, idx) => (
                        <div key={idx} className="text-sm p-2 rounded bg-muted/50">
                          {player}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {match.strHomeLineupMidfield && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Midfield</h4>
                    <div className="space-y-1">
                      {parseLineup(match.strHomeLineupMidfield).map((player, idx) => (
                        <div key={idx} className="text-sm p-2 rounded bg-muted/50">
                          {player}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {match.strHomeLineupForward && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Forward</h4>
                    <div className="space-y-1">
                      {parseLineup(match.strHomeLineupForward).map((player, idx) => (
                        <div key={idx} className="text-sm p-2 rounded bg-muted/50">
                          {player}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Away Team Lineup */}
            <Card className="match-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 team-away">
                  <Users className="h-5 w-5" />
                  {match.strAwayTeam}
                  {match.strAwayFormation && (
                    <Badge variant="secondary">{match.strAwayFormation}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {match.strAwayLineupGoalkeeper && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Goalkeeper</h4>
                    <div className="space-y-1">
                      {parseLineup(match.strAwayLineupGoalkeeper).map((player, idx) => (
                        <div key={idx} className="text-sm p-2 rounded bg-muted/50">
                          {player}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {match.strAwayLineupDefense && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Defense</h4>
                    <div className="space-y-1">
                      {parseLineup(match.strAwayLineupDefense).map((player, idx) => (
                        <div key={idx} className="text-sm p-2 rounded bg-muted/50">
                          {player}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {match.strAwayLineupMidfield && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Midfield</h4>
                    <div className="space-y-1">
                      {parseLineup(match.strAwayLineupMidfield).map((player, idx) => (
                        <div key={idx} className="text-sm p-2 rounded bg-muted/50">
                          {player}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {match.strAwayLineupForward && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Forward</h4>
                    <div className="space-y-1">
                      {parseLineup(match.strAwayLineupForward).map((player, idx) => (
                        <div key={idx} className="text-sm p-2 rounded bg-muted/50">
                          {player}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card className="match-card">
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Match Events</h3>
              <p className="text-muted-foreground">
                Goals, cards, and substitutions will appear here during live matches.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="match-card">
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Match Statistics</h3>
              <p className="text-muted-foreground">
                Possession, shots, and other stats will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchDetails;