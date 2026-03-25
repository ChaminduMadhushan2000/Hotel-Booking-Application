import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  public constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  public async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id, deletedAt: IsNull() } });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email, deletedAt: IsNull() } });
  }
}
