export interface Food {
  id: number;
  name: string;
  barcode: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  micronutrients: Record<string, string>;
  isPublic: boolean;
  createdById?: number;
  servingSize?: number;
  servingUnit?: string;
}

export interface FoodRequestDTO {
  name: string;
  barcode?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  micronutrients?: Record<string, string>;
  isPublic: boolean;
  createdById?: number;
  servingSize?: number;
  servingUnit?: string;
}

export interface FoodLogRequestDTO {
  foodId: number;
  grams: number;
  date: string;
  mealName: string;
}

export interface FoodLogResponseDTO {
  id: number;
  foodId: number;
  foodName: string;
  grams: number;
  date: string;
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  micronutrients: Record<string, string>;
}

export interface DailyNutritionSummary {
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFats: number;
}
