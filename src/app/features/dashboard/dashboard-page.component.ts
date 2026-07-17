import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';

import { RouterLink } from '@angular/router';
import { NutritionService } from '../nutrition/nutrition.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent implements OnInit {
  private authService = inject(AuthService);
  private nutritionService = inject(NutritionService);

  public user = this.authService.currentUser;
  
  public dailyLogs = this.nutritionService.dailyLogs;

  public consumedSummary = computed(() => {
    const logs = this.dailyLogs();
    let calories = 0, protein = 0, carbs = 0, fats = 0;
    
    for (const log of logs) {
      calories += log.calories;
      protein += log.protein;
      carbs += log.carbs;
      fats += log.fats;
    }
    
    return { calories, protein, carbs, fats };
  });

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.nutritionService.fetchDailyLogs(today).subscribe({
      next: (logs) => this.nutritionService.setDailyLogs(logs),
      error: (err) => console.error('Failed to load today logs for dashboard', err)
    });
  }

  logout() {
    this.authService.logout();
  }
}
