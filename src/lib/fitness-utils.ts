'use client';

/**
 * @fileOverview Utility functions for fitness calculations.
 */

export interface WorkoutMetrics {
  totalVolume: number;
  durationMinutes: number;
  caloriesBurned: number;
  intensity: 'LOW/RECOVERY ⚪' | 'MEDIUM 🟠' | 'HIGH INTENSITY ⚡';
}

/**
 * Calculates metrics for a workout session using the MET method.
 * Formula: Calories Burned = ((MET * 3.5 * Weight_kg) / 200) * Duration_min
 */
export function calculateWorkoutMetrics(
  exercises: any[],
  userWeightKg: number,
  durationMinutes: number
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

  // 2. Assign MET based on Intensity thresholds
  // < 1000kg -> 3.5
  // 1000kg - 1500kg -> 4.5
  // > 1500kg -> 6.0
  let met = 3.5;
  let intensity: 'LOW/RECOVERY ⚪' | 'MEDIUM 🟠' | 'HIGH INTENSITY ⚡' = 'LOW/RECOVERY ⚪';

  if (totalVolume > 1500) {
    met = 6.0;
    intensity = 'HIGH INTENSITY ⚡';
  } else if (totalVolume >= 1000) {
    met = 4.5;
    intensity = 'MEDIUM 🟠';
  } else {
    met = 3.5;
    intensity = 'LOW/RECOVERY ⚪';
  }

  // 3. MET Formula: ((MET * 3.5 * Weight) / 200) * Duration
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
