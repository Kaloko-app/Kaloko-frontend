export interface AuthModel {}

export interface LoginRequestDTO {
  username: string;
  password: string;
}

export interface RegisterRequestDTO {
  username: string;
  email: string;
  password: string;
  gender: 'MALE' | 'FEMALE' | 'UNSPECIFIED';
}

export interface UserResponseDTO {
  id: number;
  username: string;
  email: string;
  currentWeight?: number;
  weightGoal?: number;
  height?: number;
  age?: number;
  activityLevel?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE';
  gender?: 'MALE' | 'FEMALE' | 'UNSPECIFIED';
  bodyFatPercentage?: number;
  dailyCalories?: number;
  proteinGoal?: number;
  carbGoal?: number;
  fatGoal?: number;
}

export interface AuthResponseDTO {
  token: string;
  refreshToken: string;
  user: UserResponseDTO;
}

export interface UserMetricsRequestDTO {
  userId: number;
  currentWeight: number;
  weightGoal: number;
  height: number;
  age: number;
  activityLevel: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE';
  gender: 'MALE' | 'FEMALE' | 'UNSPECIFIED';
  bodyFatPercentage?: number;
}
