import { Component, output, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginRequestDTO } from './auth.model';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styles: ``
})
export class LoginFormComponent {
  public login = output<LoginRequestDTO>();
  public errorMessage = input<string | null>(null);
  
  private fb = inject(NonNullableFormBuilder);

  public form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit() {
    if (this.form.valid) {
      this.login.emit(this.form.getRawValue());
    }
  }
}
