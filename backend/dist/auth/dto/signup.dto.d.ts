import { Role } from '../../users/enums/role.enum';
export declare class SignupDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    dateOfBirth?: string;
    phone?: string;
    referralCode?: string;
}
