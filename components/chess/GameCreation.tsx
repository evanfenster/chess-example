'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, Share2 } from 'lucide-react';

interface GameCreationProps {
  onBack: () => void;
  onGameCreated: (code: string) => void;
}

export function GameCreation({ onBack, onGameCreated }: GameCreationProps) {
  const [colorPreference, setColorPreference] = useState('random');

  const handleCreateGame = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    onGameCreated(code);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Button
          variant="ghost"
          className="w-fit -ml-2 mb-2"
          onClick={onBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <CardTitle className="text-2xl">Create New Game</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Color Preference</Label>
          <RadioGroup
            defaultValue="random"
            value={colorPreference}
            onValueChange={setColorPreference}
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
        >
          <Share2 className="mr-2 h-5 w-5" />
          Create Game
        </Button>
      </CardContent>
    </Card>
  );
}