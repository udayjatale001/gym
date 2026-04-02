'use client';

/**
 * @fileOverview Utility functions for fitness calculations.
 */

export interface WorkoutMetrics {
  totalVolume: number;
  durationMinutes: number;
  caloriesBurned: number;
  intensity: 'Moderate' | 'Vigorous';
}

/**
 * Calculates metrics for a workout session using the MET method.
 * Formula: Calories Burned = ((MET * 3.5 * Weight_kg) / 200) * Duration_min
 */
export function calculateWorkoutMetrics(
  exercises: any[],
  userWeightKg: number,
  startTime?: string,
  endTime?: string
): WorkoutMetrics {
  // 1. Calculate Total Volume (Reps x Weight)
  let totalVolume = 0;
  exercises.forEach((ex) => {
    ex.sets.forEach((set: any) => {
      const weight = parseFloat(set.weight) || 0;
      const reps = parseInt(set.reps) || 0;
      totalVolume += weight * reps;
    });
  });

  // 2. Determine Duration (Default to 45-50 mins as per screenshots if timestamps missing)
  let durationMinutes = 45;
  if (startTime && endTime) {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    durationMinutes = Math.max(1, Math.round((end - start) / (1000 * 60)));
  }

  // 3. Assign MET based on Intensity
  // Vigorous: > 1500kg volume in 45m
  // Moderate: < 1000kg volume
  let met = 4.0;
  let intensity: 'Moderate' | 'Vigorous' = 'Moderate';

  if (totalVolume >= 1500) {
    met = 6.0;
    intensity = 'Vigorous';
  } else if (totalVolume >= 1000) {
    met = 5.0; // Mid-range
    intensity = 'Moderate';
  }

  // 4. MET Formula
  const caloriesBurned = Math.round(((met * 3.5 * userWeightKg) / 200) * durationMinutes);

  return {
    totalVolume,
    durationMinutes,
    caloriesBurned,
    intensity,
  };
}

/**
 * Generates an explanation for rapid weight fluctuations.
 */
export function getWeightFluctuationExplanation(
  currentWeight: number,
  previousWeight: number,
  calorieBurn: number
): string | null {
  const weightDiff = previousWeight - currentWeight;
  
  // If weight dropped > 2kg and calorie burn is relatively low (< 500)
  if (weightDiff >= 2 && calorieBurn < 500) {
    return "Note: Weight fluctuations this rapid are often due to water retention and glycogen levels, not actual fat loss, especially when dynamic calorie burn is below ~500. Your hard work has paid off, but rapid fluctuations are normal!";
  }
  
  return null;
}
