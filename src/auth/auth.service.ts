import {
    Injectable,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import * as bcrypt from 'bcrypt';
import { createHash, randomInt } from 'crypto';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) { }

    private generateOtp(): string {
        return randomInt(100000, 1000000).toString();
    }

    private hashOtp(otp: string): string {
        return createHash('sha256').update(otp).digest('hex');
    }
    // Generate verification OTPs


    async register(registerDto: RegisterDto) {
        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            country,
            state,
            city,
            role,
        } = registerDto;

        // Check whether email or phone already exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: email.toLowerCase() },
                    { phone },
                ],
            },
        });

        if (existingUser) {
            if (existingUser.email === email.toLowerCase()) {
                throw new ConflictException('Email is already registered');
            }

            throw new ConflictException('Phone number is already registered');
        }

        // Hash the password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const emailOtp = this.generateOtp();
        const phoneOtp = this.generateOtp();

        // Hash the OTPs before storing them
        const emailOtpHash = this.hashOtp(emailOtp);
        const phoneOtpHash = this.hashOtp(phoneOtp);


        // Create the user
        const user = await this.prisma.user.create({
            data: {
                firstName,
                lastName,
                email: email.toLowerCase(),
                passwordHash,
                phone,
                country,
                state,
                city,
                role,
                status: 'PENDING_VERIFICATION',
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                country: true,
                state: true,
                city: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });

        // Save both OTPs
        await this.prisma.verificationOtp.createMany({
            data: [
                {
                    userId: user.id,
                    type: 'EMAIL',
                    codeHash: emailOtpHash,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                },
                {
                    userId: user.id,
                    type: 'PHONE',
                    codeHash: phoneOtpHash,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                },
            ],
        });

        return {
            message: 'Account created successfully. Please verify your email and phone number.',
            user,
        };
    }
}