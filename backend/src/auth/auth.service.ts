import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../users/enums/role.enum';
import { AccountStatus } from '../users/enums/account-status.enum';

export interface AuthResponse {
  access_token: string;
  user: Omit<User, 'passwordHash'>;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthResponse> {
    // Check if email already in use
    const existingUser = await this.usersRepository.findOne({
      where: { email: signupDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Validate role — only CLIENT or PROVIDER allowed at signup
    if (
      signupDto.role !== Role.CLIENT &&
      signupDto.role !== Role.PROVIDER
    ) {
      throw new BadRequestException(
        'Only CLIENT or PROVIDER roles are allowed at signup',
      );
    }

    // Provider-specific validations
    if (signupDto.role === Role.PROVIDER) {
      if (!signupDto.dateOfBirth) {
        throw new BadRequestException(
          'Date of birth is required for provider registration',
        );
      }

      // Validate age: must be between 16 and 25
      const dob = new Date(signupDto.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 16) {
        throw new BadRequestException(
          'You must be at least 16 years old to register as a provider',
        );
      }
      if (age > 25) {
        throw new BadRequestException(
          'Provider registration is limited to ages 16-25',
        );
      }
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(signupDto.password, salt);

    // Generate referral code
    const referralCode = this.generateReferralCode();

    const user = this.usersRepository.create({
      firstName: signupDto.firstName,
      lastName: signupDto.lastName,
      email: signupDto.email,
      passwordHash,
      role: signupDto.role,
      dateOfBirth: signupDto.dateOfBirth,
      phone: signupDto.phone,
      referralCode,
    });

    const savedUser = await this.usersRepository.save(user);

    const payload = {
      email: savedUser.email,
      sub: savedUser.id,
      role: savedUser.role,
    };
    const { passwordHash: _, ...result } = savedUser;

    return {
      access_token: this.jwtService.sign(payload),
      user: result,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is suspended or banned
    if (user.accountStatus === AccountStatus.SUSPENDED) {
      throw new UnauthorizedException(
        'Your account has been suspended due to low ratings. Please contact support.',
      );
    }
    if (user.accountStatus === AccountStatus.BANNED) {
      throw new UnauthorizedException('Your account has been banned.');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    const { passwordHash: _, ...result } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: result,
    };
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'HELPUP-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
