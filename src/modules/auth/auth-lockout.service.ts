import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceResult } from '../shared/types/service-result';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthLockoutService {
  public constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  public async _checkLockout(user: User): Promise<ServiceResult<boolean>> {
    if (user.lockedUntil === null || user.lockedUntil.getTime() <= Date.now()) {
      return { success: true, message: 'Not locked', data: true };
    }
    return {
      success: false,
      message: 'Account locked. Try again later.',
      data: null,
    };
  }

  public async _recordFailedAttempt(user: User): Promise<ServiceResult<User>> {
    const attempts = user.failedLoginAttempts + 1;
    const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
    user.failedLoginAttempts = attempts >= 5 ? 0 : attempts;
    user.lockedUntil = lockedUntil;
    const saved = await this.userRepo.save(user);
    return { success: true, message: 'Failed attempt recorded', data: saved };
  }

  public async _resetFailedAttempts(user: User): Promise<ServiceResult<User>> {
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    const saved = await this.userRepo.save(user);
    return { success: true, message: 'Failed attempts reset', data: saved };
  }
}
