
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { predictFitnessProgressAndAdvice, PredictFitnessProgressAndAdviceOutput } from "@/ai/flows/predict-fitness-progress-and-advice";
import { BrainCircuit, Loader2, Target, Trophy, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProgressAIPage() {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictFitnessProgressAndAdviceOutput | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    try {
      // Mocking user data to feed into the flow
      const result = await predictFitnessProgressAndAdvice({
        currentWeight: 78.5,
        targetWeight: 72.0,
        height: 175,
        age: 28,
        gender: 'male',
        activityLevel: 'moderately active',
        weeklyWeightLogs: [
          { date: '2023-10-18', weight: 79.2 },
          { date: '2023-10-19', weight: 79.0 },
          { date: '2023-10-20', weight: 78.8 },
          { date: '2023-10-21', weight: 78.9 },
          { date: '2023-10-22', weight: 78.6 },
          { date: '2023-10-23', weight: 78.5 },
          { date: '2023-10-24', weight: 78.4 },
        ],
        dailyCalorieIntakeLogs: [
          { date: '2023-10-18', calories: 2100 },
          { date: '2023-10-19', calories: 1950 },
          { date: '2023-10-20', calories: 2200 },
          { date: '2023-10-21', calories: 2050 },
          { date: '2023-10-22', calories: 1800 },
          { date: '2023-10-23', calories: 1900 },
          { date: '2023-10-24', calories: 2000 },
        ],
        workoutLogs: [
          { date: '2023-10-18', description: 'Push Session', durationMinutes: 60, intensity: 'high' },
          { date: '2023-10-20', description: 'Pull Session', durationMinutes: 55, intensity: 'medium' },
          { date: '2023-10-22', description: 'Leg Day', durationMinutes: 70, intensity: 'high' },
        ],
        fitnessGoals: 'lose weight and tone up',
        dietaryPreferences: 'High protein, includes Indian vegetarian food',
      });
      setPrediction(result);
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          AI Progress Predictor
        </h2>
        <p className="text-xs text-muted-foreground">
          Uses your recent logs to forecast your fitness journey.
        </p>
      </div>

      {!prediction ? (
        <Card className="border-dashed border-2 bg-primary/5">
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
              <BrainCircuit className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold">Ready to analyze?</h3>
              <p className="text-xs text-muted-foreground px-4">
                We'll look at your weights, calories, and workouts from the last 7 days to give you a roadmap.
              </p>
            </div>
            <Button 
              onClick={handlePredict} 
              disabled={loading}
              className="w-full rounded-full h-12 text-sm font-bold shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Data...
                </>
              ) : (
                "Predict My Progress"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Target className="h-5 w-5 mb-2" />
                <p className="text-[10px] uppercase font-bold opacity-80">Goal Weight</p>
                <p className="text-xl font-black">72.0 kg</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary text-secondary-foreground border-none">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Calendar className="h-5 w-5 mb-2" />
                <p className="text-[10px] uppercase font-bold opacity-80">Estimated Weeks</p>
                <p className="text-xl font-black">{prediction.predictedTimeToGoalWeeks}</p>
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-accent/10 border-accent/20">
            <Info className="h-4 w-4 text-accent-foreground" />
            <AlertTitle className="text-xs font-bold uppercase text-accent-foreground">Average Weekly Change</AlertTitle>
            <AlertDescription className="text-lg font-black text-accent-foreground">
              {prediction.predictedWeightChangeWeekly > 0 ? "+" : ""}{prediction.predictedWeightChangeWeekly} kg / week
            </AlertDescription>
          </Alert>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Progress Summary</h3>
            <Card>
              <CardContent className="p-4 italic text-sm text-muted-foreground leading-relaxed">
                "{prediction.overallProgressSummary}"
              </CardContent>
            </Card>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Personalized Advice</h3>
            <div className="space-y-3">
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-xs uppercase text-primary font-bold">Diet</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 text-sm">
                  {prediction.advice.dietAdvice}
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-secondary">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-xs uppercase text-secondary font-bold">Workout</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 text-sm">
                  {prediction.advice.workoutAdvice}
                </CardContent>
              </Card>
            </div>
          </section>

          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none">
            <CardContent className="p-6 flex items-center gap-4">
              <Trophy className="h-10 w-10 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold opacity-80">Coach Says</p>
                <p className="text-sm font-medium leading-tight">
                  {prediction.advice.motivationBoost}
                </p>
              </div>
            </CardContent>
          </Card>

          <Button 
            variant="outline" 
            className="w-full rounded-full"
            onClick={() => setPrediction(null)}
          >
            Run New Prediction
          </Button>
        </div>
      )}
    </div>
  );
}

import { Calendar as CalendarIcon } from "lucide-react";
