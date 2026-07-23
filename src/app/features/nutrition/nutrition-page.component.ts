import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NutritionService } from './nutrition.service';
import { AuthService } from '../auth/auth.service';
import { FoodLogResponseDTO } from './nutrition.model';
import { FoodSearchComponent } from './food-search.component';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-nutrition-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FoodSearchComponent, RouterLink],
  templateUrl: './nutrition-page.component.html'
})
export class NutritionPageComponent implements OnInit {
  private nutritionService = inject(NutritionService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  public user = this.authService.currentUser;
  public currentDate = signal<string>(new Date().toISOString().split('T')[0]);
  public currentMeal = signal<string>('All');
  public searchMealContext = signal<string>('Breakfast');
  public showSearchModal = signal<boolean>(false);
  
  // Inline editing state for logged food item dropdown
  public editingLogId = signal<number | null>(null);
  public editingLog = signal<FoodLogResponseDTO | null>(null);
  public editGrams = signal<number>(100);

  public calculatedEditMacros = computed(() => {
    const log = this.editingLog();
    if (!log || !log.grams || log.grams <= 0) {
      return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    }
    const currentGrams = this.editGrams() || 0;
    const ratio = currentGrams / log.grams;
    return {
      calories: Math.round(log.calories * ratio),
      protein: Math.round(log.protein * ratio),
      carbs: Math.round(log.carbs * ratio),
      fats: Math.round(log.fats * ratio)
    };
  });

  public dailyLogs = this.nutritionService.dailyLogs;

  public dailySummary = computed(() => {
    let calories = 0, protein = 0, carbs = 0, fats = 0;
    for (const log of this.dailyLogs()) {
      calories += log.calories; protein += log.protein; carbs += log.carbs; fats += log.fats;
    }
    return { calories, protein, carbs, fats };
  });

  public mealsData = computed(() => {
    const allLogs = this.dailyLogs();
    const filterMeal = this.currentMeal();
    
    const mealNames = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    const activeMeals = filterMeal === 'All' ? mealNames : [filterMeal];
    
    return activeMeals.map(mealName => {
      const logs = allLogs.filter(log => log.mealName === mealName);
      let calories = 0, protein = 0, carbs = 0, fats = 0;
      for (const log of logs) {
        calories += log.calories; protein += log.protein; carbs += log.carbs; fats += log.fats;
      }
      return {
        name: mealName,
        logs,
        summary: { calories, protein, carbs, fats }
      };
    });
  });

  public openAddFood(mealName: string) {
    this.searchMealContext.set(mealName);
    this.showSearchModal.set(true);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['meal']) {
        this.currentMeal.set(params['meal']);
      } else {
        this.currentMeal.set('All');
      }
    });
    this.loadLogsForDate(this.currentDate());
  }

  public displayDate = computed(() => {
    const d = this.currentDate();
    const today = new Date().toISOString().split('T')[0];
    
    const todayDate = new Date(today);
    const targetDate = new Date(d);
    
    const diffTime = targetDate.getTime() - todayDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';
    
    return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });

  private modifyDate(days: number) {
    const parts = this.currentDate().split('-');
    const dateObj = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
    dateObj.setUTCDate(dateObj.getUTCDate() + days);
    const newDateStr = dateObj.toISOString().split('T')[0];
    this.currentDate.set(newDateStr);
    this.loadLogsForDate(newDateStr);
  }

  previousDay() {
    this.modifyDate(-1);
  }

  nextDay() {
    this.modifyDate(1);
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.currentDate.set(input.value);
      this.loadLogsForDate(input.value);
    }
  }

  loadLogsForDate(date: string) {
    this.nutritionService.fetchDailyLogs(date).subscribe({
      next: (logs) => this.nutritionService.setDailyLogs(logs),
      error: (err) => console.error('Failed to load logs', err)
    });
  }

  onLogAdded() {
    this.loadLogsForDate(this.currentDate());
  }

  toggleEditLog(log: FoodLogResponseDTO) {
    if (this.editingLogId() === log.id) {
      this.editingLogId.set(null);
      this.editingLog.set(null);
    } else {
      this.editingLogId.set(log.id);
      this.editingLog.set(log);
      this.editGrams.set(log.grams);
    }
  }

  saveLogEdit(logId: number) {
    if (this.editGrams() <= 0) return;
    this.nutritionService.updateFoodLog(logId, this.editGrams()).subscribe({
      next: () => {
        this.editingLogId.set(null);
        this.editingLog.set(null);
        this.loadLogsForDate(this.currentDate());
      },
      error: (err) => console.error('Failed to update log', err)
    });
  }

  deleteLog(logId: number) {
    this.nutritionService.deleteFoodLog(logId).subscribe({
      next: () => {
        this.editingLogId.set(null);
        this.editingLog.set(null);
        this.loadLogsForDate(this.currentDate());
      },
      error: (err) => console.error('Failed to delete log', err)
    });
  }
}
