import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  public id!: string;

  @Expose()
  public email!: string;

  @Expose()
  public firstName!: string;

  @Expose()
  public lastName!: string;

  @Expose()
  public role!: string;

  @Expose()
  public createdAt!: Date;
}
