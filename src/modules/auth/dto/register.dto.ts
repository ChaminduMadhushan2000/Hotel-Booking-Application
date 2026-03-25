import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  public email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/[A-Z]/, {
    message: 'password must contain at least one uppercase letter',
  })
  @Matches(/[0-9]/, {
    message: 'password must contain at least one number',
  })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'password must contain at least one special character',
  })
  public password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  public firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  public lastName!: string;
}
