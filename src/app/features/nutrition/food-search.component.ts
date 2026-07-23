import { Component, inject, output, input, signal, computed } from '@angular/core';
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
  
  // Item Category: food | recipe
  public itemType = signal<'food' | 'recipe'>('food');

  // Tabs: all, recents, favorites
  public activeTab = signal<'all' | 'recents' | 'favorites'>('all');
  public favorites = signal<Food[]>([]);
  public recents = signal<Food[]>([]);

  // Filtered lists based on search input
  public filteredRecents = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.recents();
    return this.recents().filter(f => f.name.toLowerCase().includes(q));
  });

  public filteredFavorites = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.favorites();
    return this.favorites().filter(f => f.name.toLowerCase().includes(q));
  });
  
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
  
  // Log details & Servings
  public grams = signal<number>(100);
  public servingUnitMode = signal<'grams' | 'serving'>('grams');
  public servingQuantity = signal<number>(1);

  public effectiveGrams = computed(() => {
    const food = this.selectedFood();
    if (this.servingUnitMode() === 'serving' && food && food.servingSize) {
      return Math.round(this.servingQuantity() * food.servingSize);
    }
    return this.grams();
  });

  public calculatedMacros = computed(() => {
    const food = this.selectedFood();
    if (!food) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const mult = (this.effectiveGrams() || 0) / 100.0;
    return {
      calories: Math.round((food.calories || 0) * mult),
      protein: Math.round((food.protein || 0) * mult),
      carbs: Math.round((food.carbs || 0) * mult),
      fats: Math.round((food.fats || 0) * mult)
    };
  });

  public date = input.required<string>();
  public currentMealContext = input<string>('Breakfast');
  public selectedMealToLog = signal<string>('Breakfast');

  private searchSubject = new Subject<string>();
  private route = inject(ActivatedRoute);

  constructor() {
    this.loadFavoritesAndRecents();

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
    if (food.servingSize && food.servingUnit) {
      this.servingUnitMode.set('serving');
      this.servingQuantity.set(1);
    } else {
      this.servingUnitMode.set('grams');
      this.grams.set(100);
    }
  }

  loadFavoritesAndRecents() {
    // Favorites: Persisted in Database for current user
    this.nutritionService.fetchFavoriteFoods().pipe(
      catchError(() => of([]))
    ).subscribe(favs => {
      this.favorites.set(favs);
    });
    
    // Recents: Cached in localStorage per device
    try {
      const recs = localStorage.getItem('kaloko_recent_foods');
      if (recs) this.recents.set(JSON.parse(recs));
    } catch (e) {
      console.error('Error loading recents', e);
    }
  }

  toggleFavorite(food: Food, event?: Event) {
    if (event) event.stopPropagation();
    const currentFavs = this.favorites();
    const isFav = currentFavs.some(f => f.id === food.id);
    let updated: Food[];
    if (isFav) {
      updated = currentFavs.filter(f => f.id !== food.id);
    } else {
      updated = [food, ...currentFavs];
    }
    this.favorites.set(updated);

    this.nutritionService.toggleFavoriteFood(food.id).subscribe({
      error: () => this.favorites.set(currentFavs) // Rollback on error
    });
  }

  isFavorite(food: Food): boolean {
    return this.favorites().some(f => f.id === food.id);
  }

  saveToRecents(food: Food) {
    const currentRecs = this.recents().filter(f => f.id !== food.id);
    const updated = [food, ...currentRecs].slice(0, 15);
    this.recents.set(updated);
    localStorage.setItem('kaloko_recent_foods', JSON.stringify(updated));
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
      grams: this.effectiveGrams(),
      date: this.date(),
      mealName: this.currentMealContext() === 'All' ? this.selectedMealToLog() : this.currentMealContext()
    };

    this.nutritionService.logFood(request).subscribe({
      next: () => {
        this.saveToRecents(food);
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
