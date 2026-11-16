import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );
  }

  async sendVerificationOtp(
    email: string,
    firstName: string,
    otp: string,
  ) {
    const { data, error } = await this.resend.emails.send({
      from: 'VORVENA <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your VORVENA account',
      html: `
        <h2>Welcome to VORVENA, ${firstName}!</h2>
        <p>Your email verification code is:</p>
        <h1>${otp}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>Please do not share this code with anyone.</p>
      `,
    });

    if (error) {
      console.error('Email delivery failed:', error);
      throw new InternalServerErrorException(
        'Unable to send verification email.',
      );
    }

    return data;
  }
}