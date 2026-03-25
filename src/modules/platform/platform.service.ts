import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

interface PlatformStatusResponse {
  maintenanceMode: boolean;
  message: string;
}

interface PlatformMasterData {
  countries: string[];
  currencies: string[];
  languages: string[];
  timezones: string[];
  bookingStatuses: string[];
  roomTypes: string[];
  paymentStatuses: string[];
}

interface AppVersionResponse {
  currentVersion: string;
  minimumVersion: string;
  forceUpdate: boolean;
}

@Injectable()
export class PlatformService {
  private readonly redis = new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
  });

  public getStatus(): PlatformStatusResponse {
    return { maintenanceMode: false, message: 'Platform is operational' };
  }

  public async getMasterData(): Promise<PlatformMasterData> {
    const cacheKey = 'hotel:platform:master-data';
    const cached = await this.redis.get(cacheKey);
    if (cached !== null) {
      return JSON.parse(cached) as PlatformMasterData;
    }

    const data: PlatformMasterData = {
      countries: ['Sri Lanka', 'India', 'Singapore', 'United Arab Emirates'],
      currencies: ['LKR', 'USD', 'EUR', 'AED'],
      languages: ['en', 'si', 'ta'],
      timezones: ['Asia/Colombo', 'Asia/Dubai', 'Asia/Singapore'],
      bookingStatuses: ['pending', 'confirmed', 'cancelled', 'completed'],
      roomTypes: ['single', 'double', 'suite', 'deluxe'],
      paymentStatuses: ['pending', 'paid', 'failed', 'refunded'],
    };

    await this.redis.set(cacheKey, JSON.stringify(data), 'EX', 3600);
    return data;
  }

  public getAppVersion(platform: 'android' | 'ios'): AppVersionResponse {
    if (platform === 'android') {
      return { currentVersion: '2.4.0', minimumVersion: '2.2.0', forceUpdate: false };
    }
    return { currentVersion: '2.5.1', minimumVersion: '2.3.0', forceUpdate: false };
  }
}
