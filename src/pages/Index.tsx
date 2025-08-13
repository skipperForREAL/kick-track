import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Calendar, BarChart3, ArrowLeft } from 'lucide-react';
import LiveMatches from '@/components/LiveMatches';
import MatchDetails from '@/components/MatchDetails';
import TodayMatches from '@/components/TodayMatches';

type View = 'home' | 'match-details';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('live');

  const handleMatchSelect = (matchId: string) => {
    setSelectedMatchId(matchId);
    setCurrentView('match-details');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedMatchId('');
  };

  if (currentView === 'match-details') {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <MatchDetails matchId={selectedMatchId} onBack={handleBackToHome} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12 slide-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Play className="h-12 w-12 text-primary" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-match-live rounded-full pulse-glow"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-3">
            Kick Track
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your ultimate destination for live football matches, real-time scores, and comprehensive match details.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge variant="outline" className="match-live pulse-glow border-match-live text-match-live">
              LIVE UPDATES
            </Badge>
            <Badge variant="outline" className="text-primary border-primary">
              REAL-TIME SCORES
            </Badge>
          </div>
        </header>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
            <TabsTrigger value="live" className="flex items-center gap-2 text-sm">
              <Play className="h-4 w-4" />
              Live Matches
            </TabsTrigger>
            <TabsTrigger value="today" className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Today's Games
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            <LiveMatches onMatchSelect={handleMatchSelect} />
          </TabsContent>

          <TabsContent value="today" className="space-y-6">
            <TodayMatches onMatchSelect={handleMatchSelect} />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="text-center py-16">
              <BarChart3 className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-3">Statistics Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Detailed league tables, player statistics, and team performance analytics will be available here.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Powered by TheSportsDB API • Real-time football data
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-2 w-2 bg-match-live rounded-full pulse-glow"></div>
            <span className="text-xs text-muted-foreground">Live updates every 30 seconds</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;