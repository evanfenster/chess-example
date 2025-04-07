'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, Share2, Loader2 } from 'lucide-react';
import { createGame } from '@/lib/actions/chess';

interface GameCreationProps {
  onBack: () => void;
  onGameCreated: (code: string) => void;
  playerId?: string;
}

export function GameCreation({ onBack, onGameCreated, playerId = 'guest' }: GameCreationProps) {
  const [colorPreference, setColorPreference] = useState<'white' | 'black' | 'random'>('random');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGame = async () => {
    try {
      setIsCreating(true);
      setError(null);
      
      const gameData = await createGame({
        colorPreference,
        playerId
      });
      
      console.log('Game created:', gameData);
      onGameCreated(gameData.gameCode);
    } catch (error) {
      console.error('Error creating game:', error);
      setError('Failed to create game. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Button
          variant="ghost"
          className="w-fit -ml-2 mb-2"
          onClick={onBack}
          disabled={isCreating}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <CardTitle className="text-2xl">Create New Game</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <Label>Color Preference</Label>
          <RadioGroup
            defaultValue="random"
            value={colorPreference}
            onValueChange={(value) => setColorPreference(value as 'white' | 'black' | 'random')}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="white" id="white" />
              <Label htmlFor="white">White</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="black" id="black" />
              <Label htmlFor="black">Black</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="random" id="random" />
              <Label htmlFor="random">Random</Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCreateGame}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Game...
            </>
          ) : (
            <>
              <Share2 className="mr-2 h-5 w-5" />
              Create Game
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}