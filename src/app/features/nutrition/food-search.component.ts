import { Component, inject, output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NutritionService } from './nutrition.service';
import { Food, FoodRequestDTO } from './nutrition.model';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-food-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './food-search.component.html'
})
export class FoodSearchComponent {
  private nutritionService = inject(NutritionService);
  
  public logAdded = output<void>();

  public searchQuery = signal<string>('');
  public searchResults = signal<Food[]>([]);
  public selectedFood = signal<Food | null>(null);
  public hasSearched = signal<boolean>(false);
  
  // Creation Mode
  public isCreating = signal<boolean>(false);
  public newFood = signal<FoodRequestDTO>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    micronutrients: {},
    isPublic: true
  });
  public newMicroKey = signal<string>('');
  public newMicroValue = signal<string>('');
  
  // Log details
  public grams = signal<number>(100);
  public date = input.required<string>();
  public currentMealContext = input<string>('Breakfast');
  public selectedMealToLog = signal<string>('Breakfast');

  private searchSubject = new Subject<string>();
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.queryParams.subscribe(params => {
      const paramMeal = params['meal'];
      if (paramMeal && paramMeal !== 'All') {
        this.selectedMealToLog.set(paramMeal);
      }
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.hasSearched.set(true);
        if (!query || query.trim().length === 0) {
          this.hasSearched.set(false);
          return of([]);
        }
        return this.nutritionService.searchFoods(query).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe(results => {
      this.searchResults.set(results);
    });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.searchSubject.next(input.value);
    if (!input.value) {
      this.selectedFood.set(null);
    }
  }

  selectFood(food: Food) {
    this.selectedFood.set(food);
    this.searchResults.set([]);
    this.searchQuery.set(food.name);
    this.isCreating.set(false);
  }

  toggleCreateMode() {
    this.isCreating.set(!this.isCreating());
    if (this.isCreating()) {
      this.newFood.set({
        name: this.searchQuery(),
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        micronutrients: {},
        isPublic: true
      });
      this.selectedFood.set(null);
      this.searchResults.set([]);
    }
  }

  updateNewFoodField(field: keyof FoodRequestDTO, value: any) {
    this.newFood.update(f => ({ ...f, [field]: value }));
  }

  addMicronutrient() {
    const key = this.newMicroKey().trim();
    const value = this.newMicroValue().trim();
    if (key && value) {
      const updated = { ...this.newFood().micronutrients, [key]: value };
      this.newFood.update(f => ({ ...f, micronutrients: updated }));
      this.newMicroKey.set('');
      this.newMicroValue.set('');
    }
  }

  removeMicronutrient(key: string) {
    const updated = { ...this.newFood().micronutrients };
    delete updated[key];
    this.newFood.update(f => ({ ...f, micronutrients: updated }));
  }

  createNewFood() {
    this.nutritionService.createFood(this.newFood()).subscribe({
      next: (food) => {
        this.selectFood(food);
        this.isCreating.set(false);
      },
      error: (err) => console.error('Failed to create food', err)
    });
  }

  addFoodLog() {
    const food = this.selectedFood();
    if (!food) return;

    const request = {
      foodId: food.id,
      grams: this.grams(),
      date: this.date(),
      mealName: this.currentMealContext() === 'All' ? this.selectedMealToLog() : this.currentMealContext()
    };

    this.nutritionService.logFood(request).subscribe({
      next: () => {
        this.logAdded.emit();
        // Reset form
        this.selectedFood.set(null);
        this.searchQuery.set('');
        this.grams.set(100);
        this.hasSearched.set(false);
      },
      error: (err) => console.error('Failed to log food', err)
    });
  }
}
