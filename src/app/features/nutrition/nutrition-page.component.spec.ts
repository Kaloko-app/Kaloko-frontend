import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NutritionPageComponent } from './nutrition-page.component';
import { NutritionService } from './nutrition.service';
import { AuthService } from '../auth/auth.service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';

describe('NutritionPageComponent', () => {
  let component: NutritionPageComponent;
  let fixture: ComponentFixture<NutritionPageComponent>;
  let mockNutritionService: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockNutritionService = {
      dailyLogs: signal([]),
      fetchDailyLogs: vi.fn().mockReturnValue(of([])),
      setDailyLogs: vi.fn()
    };

    mockAuthService = {
      currentUser: signal({ dailyCalories: 2500, proteinGoal: 150, carbGoal: 300, fatGoal: 80 })
    };

    await TestBed.configureTestingModule({
      imports: [NutritionPageComponent],
      providers: [
        { provide: NutritionService, useValue: mockNutritionService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NutritionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate summary correctly', () => {
    mockNutritionService.dailyLogs.set([
      { calories: 500, protein: 30, carbs: 50, fats: 20 },
      { calories: 300, protein: 20, carbs: 30, fats: 10 }
    ]);

    expect(component.summary()).toEqual({
      calories: 800,
      protein: 50,
      carbs: 80,
      fats: 30
    });
  });

  it('should group logs by mealName', () => {
    mockNutritionService.dailyLogs.set([
      { id: 1, mealName: 'Breakfast', calories: 500 },
      { id: 2, mealName: 'Breakfast', calories: 200 },
      { id: 3, mealName: 'Lunch', calories: 600 }
    ]);

    const groups = component.logsByMeal();
    expect(groups.length).toBe(2);
    expect(groups[0].mealName).toBe('Breakfast');
    expect(groups[0].entries.length).toBe(2);
    expect(groups[1].mealName).toBe('Lunch');
    expect(groups[1].entries.length).toBe(1);
  });
});
