import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
export interface AuthResponse {
    access_token: string;
    user: Omit<User, 'passwordHash'>;
}
export declare class AuthService {
    private usersRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService);
    signup(signupDto: SignupDto): Promise<AuthResponse>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    private generateReferralCode;
}
