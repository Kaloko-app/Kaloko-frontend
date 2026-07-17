import { Component, output, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterFormData } from './auth.model';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-form.component.html',
  styles: ``
})
export class RegisterFormComponent {
  public register = output<RegisterFormData>();
  public errorMessage = input<string | null>(null);

  private fb = inject(NonNullableFormBuilder);

  public currentStep = signal<number>(1);

  public form = this.fb.group({
    // Step 1: Account
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    
    // Step 2: Personal
    gender: ['UNSPECIFIED', [Validators.required]],
    age: [null as number | null, [Validators.required, Validators.min(1)]],
    height: [null as number | null, [Validators.required, Validators.min(1)]],
    
    // Step 3: Fitness
    currentWeight: [null as number | null, [Validators.required, Validators.min(1)]],
    weightGoal: [null as number | null, [Validators.required, Validators.min(1)]],
    activityLevel: ['SEDENTARY', [Validators.required]],
    bodyFatPercentage: [null as number | null, [Validators.min(0.1)]]
  });

  public isStepValid(step: number): boolean {
    const controls = this.form.controls;
    if (step === 1) {
      return controls.username.valid && controls.email.valid && controls.password.valid;
    }
    if (step === 2) {
      return controls.gender.valid && controls.age.valid && controls.height.valid;
    }
    if (step === 3) {
      return this.form.valid;
    }
    return false;
  }

  public nextStep() {
    if (this.currentStep() < 3 && this.isStepValid(this.currentStep())) {
      this.currentStep.update(s => s + 1);
    }
  }

  public prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.register.emit(this.form.getRawValue() as unknown as RegisterFormData);
    }
  }
}
