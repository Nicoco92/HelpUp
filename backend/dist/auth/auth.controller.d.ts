import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(signupDto: SignupDto): Promise<import("./auth.service").AuthResponse>;
    login(loginDto: LoginDto): Promise<import("./auth.service").AuthResponse>;
}
