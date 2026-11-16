    import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsString,
    MinLength,
    MaxLength,
    } from 'class-validator';

    enum RegistrationRole {
    CLIENT = 'CLIENT',
    PROFESSIONAL = 'PROFESSIONAL',
    }

    export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    phone: string;

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsEnum(RegistrationRole)
    role: RegistrationRole;
    }