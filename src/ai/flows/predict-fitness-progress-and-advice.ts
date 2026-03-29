'use server';
/**
 * @fileOverview A Genkit flow for predicting fitness progress and providing personalized advice.
 *
 * - predictFitnessProgressAndAdvice - A function that handles the fitness prediction and advice generation process.
 * - PredictFitnessProgressAndAdviceInput - The input type for the predictFitnessProgressAndAdvice function.
 * - PredictFitnessProgressAndAdviceOutput - The return type for the predictFitnessProgressAndAdvice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictFitnessProgressAndAdviceInputSchema = z.object({
  currentWeight: z.number().describe('The user\'s current weight in kg or lbs.'),
  targetWeight: z.number().describe('The user\'s target weight in kg or lbs.'),
  height: z.number().describe('The user\'s height in cm or inches.'),
  age: z.number().describe('The user\'s age in years.'),
  gender: z.enum(['male', 'female', 'other']).describe('The user\'s gender.'),
  activityLevel: z
    .enum(['sedentary', 'lightly active', 'moderately active', 'very active', 'extremely active'])
    .describe('The user\'s general activity level.'),
  weeklyWeightLogs: z
    .array(z.object({ date: z.string().describe('Date of log (YYYY-MM-DD)'), weight: z.number().describe('Weight in kg or lbs') }))
    .describe('An array of weekly weight logs, each with a date and weight.'),
  dailyCalorieIntakeLogs: z
    .array(z.object({ date: z.string().describe('Date of log (YYYY-MM-DD)'), calories: z.number().describe('Calories consumed in kcal') }))
    .describe('An array of daily calorie intake logs, each with a date and calorie count.'),
  workoutLogs: z
    .array(
      z.object({
        date: z.string().describe('Date of workout (YYYY-MM-DD)'),
        description: z.string().describe('Brief description of the workout (e.g., \'Leg Day\', \'30 min run\')'),
        durationMinutes: z.number().describe('Duration of the workout in minutes'),
        intensity: z.enum(['low', 'medium', 'high']).describe('Intensity level of the workout'),
      })
    )
    .describe('An array of recent workout logs.'),
  dietaryPreferences: z.string().optional().describe('Optional: User\'s dietary preferences (e.g., vegetarian, vegan, low-carb).'),
  fitnessGoals: z.string().describe('The user\'s primary fitness goal (e.g., lose weight, gain muscle, improve endurance).'),
});
export type PredictFitnessProgressAndAdviceInput = z.infer<typeof PredictFitnessProgressAndAdviceInputSchema>;

const PredictFitnessProgressAndAdviceOutputSchema = z.object({
  predictedWeightChangeWeekly: z
    .number()
    .describe('Predicted average weight change per week in kg or lbs, based on input data. Positive for gain, negative for loss.'),
  predictedTimeToGoalWeeks: z
    .number()
    .describe('Estimated number of weeks to reach the target weight, considering current progress and activity.'),
  overallProgressSummary: z.string().describe('A summary of the user\'s overall progress and current status.'),
  advice: z.object({
    dietAdvice: z.string().describe('Personalized advice on how to optimize diet to achieve fitness goals.'),
    workoutAdvice: z.string().describe('Personalized advice on how to optimize workout plan to achieve fitness goals.'),
    motivationBoost: z.string().describe('An encouraging message to keep the user motivated.'),
  }),
});
export type PredictFitnessProgressAndAdviceOutput = z.infer<typeof PredictFitnessProgressAndAdviceOutputSchema>;

export async function predictFitnessProgressAndAdvice(
  input: PredictFitnessProgressAndAdviceInput
): Promise<PredictFitnessProgressAndAdviceOutput> {
  return predictFitnessProgressAndAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictFitnessProgressAndAdvicePrompt',
  input: { schema: PredictFitnessProgressAndAdviceInputSchema },
  output: { schema: PredictFitnessProgressAndAdviceOutputSchema },
  prompt: `You are an expert fitness coach and AI nutritionist. Your task is to analyze the provided user data and provide personalized predictions and actionable advice.

User Profile:
- Current Weight: {{{currentWeight}}} kg/lbs
- Target Weight: {{{targetWeight}}} kg/lbs
- Height: {{{height}}} cm/inches
- Age: {{{age}}} years
- Gender: {{{gender}}}
- Activity Level: {{{activityLevel}}}
- Fitness Goal: {{{fitnessGoals}}}
{{#if dietaryPreferences}}
- Dietary Preferences: {{{dietaryPreferences}}}
{{/if}}

Recent Data (last 7 days):

Weight Logs:
{{#each weeklyWeightLogs}}
- Date: {{{this.date}}}, Weight: {{{this.weight}}} kg/lbs
{{else}}
- No recent weight logs.
{{/each}}

Daily Calorie Intake Logs:
{{#each dailyCalorieIntakeLogs}}
- Date: {{{this.date}}}, Calories: {{{this.calories}}} kcal
{{else}}
- No recent calorie intake logs.
{{/each}}

Workout Logs:
{{#each workoutLogs}}
- Date: {{{this.date}}}, Description: {{{this.description}}}, Duration: {{{this.durationMinutes}}} mins, Intensity: {{{this.intensity}}}
{{else}}
- No recent workout logs.
{{/each}}

Based on this data, provide the following:
1.  **Predicted Average Weekly Weight Change**: A numerical estimate of how much weight the user is likely to gain or lose per week. Ensure the sign is correct (positive for gain, negative for loss).
2.  **Predicted Time to Goal**: An estimated number of weeks required to reach the target weight.
3.  **Overall Progress Summary**: A concise summary of the user's current progress and how well they are tracking towards their goals.
4.  **Personalized Advice**: Specific, actionable advice tailored to their data, goals, and preferences, covering both diet and workout, along with a motivational message.

Ensure the output is a JSON object matching the following schema. Provide concrete numbers and estimates where appropriate.
`,
});

const predictFitnessProgressAndAdviceFlow = ai.defineFlow(
  {
    name: 'predictFitnessProgressAndAdviceFlow',
    inputSchema: PredictFitnessProgressAndAdviceInputSchema,
    outputSchema: PredictFitnessProgressAndAdviceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
