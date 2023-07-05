export class SignupDto {
  name: string;
  email: string;
  role: 'trainee' | 'coach' | 'admin';
}
