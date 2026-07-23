import { inject, signal, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Food, FoodLogRequestDTO, FoodLogResponseDTO, FoodRequestDTO } from './nutrition.model';

@Service()
export class NutritionService {
  private http = inject(HttpClient);
  
  public dailyLogs = signal<FoodLogResponseDTO[]>([]);

  searchFoods(query: string): Observable<Food[]> {
    return this.http.get<Food[]>(`/api/foods/search?query=${encodeURIComponent(query)}`);
  }

  createFood(request: FoodRequestDTO): Observable<Food> {
    return this.http.post<Food>('/api/foods', request);
  }

  logFood(request: FoodLogRequestDTO): Observable<FoodLogResponseDTO> {
    return this.http.post<FoodLogResponseDTO>('/api/food-logs', request);
  }

  fetchDailyLogs(date: string): Observable<FoodLogResponseDTO[]> {
    return this.http.get<FoodLogResponseDTO[]>(`/api/food-logs/daily?date=${date}`);
  }

  setDailyLogs(logs: FoodLogResponseDTO[]) {
    this.dailyLogs.set(logs);
  }

  fetchFavoriteFoods(): Observable<Food[]> {
    return this.http.get<Food[]>('/api/foods/favorites');
  }

  toggleFavoriteFood(foodId: number): Observable<boolean> {
    return this.http.post<boolean>(`/api/foods/${foodId}/favorite`, {});
  }

  updateFoodLog(id: number, grams: number): Observable<FoodLogResponseDTO> {
    return this.http.put<FoodLogResponseDTO>(`/api/food-logs/${id}?grams=${grams}`, {});
  }

  deleteFoodLog(id: number): Observable<void> {
    return this.http.delete<void>(`/api/food-logs/${id}`);
  }
}
