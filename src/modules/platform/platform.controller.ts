import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { PlatformService } from './platform.service';

@Controller('v1/platform')
export class PlatformController {
  public constructor(private readonly platformService: PlatformService) {}

  @Get('status')
  public getStatus(): { maintenanceMode: boolean; message: string } {
    return this.platformService.getStatus();
  }

  @Get('master-data')
  public async getMasterData(): Promise<{
    countries: string[];
    currencies: string[];
    languages: string[];
    timezones: string[];
    bookingStatuses: string[];
    roomTypes: string[];
    paymentStatuses: string[];
  }> {
    return this.platformService.getMasterData();
  }

  @Get('app-version')
  public getAppVersion(
    @Query('platform') platform: string,
  ): { currentVersion: string; minimumVersion: string; forceUpdate: boolean } {
    if (platform !== 'android' && platform !== 'ios') {
      throw new BadRequestException('platform must be android or ios');
    }
    return this.platformService.getAppVersion(platform);
  }
}
