import * as Joi from 'joi';

export interface AppConfig {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  redis: {
    host: string;
    port: number;
  };
  jwt: {
    privateKey: string;
    publicKey: string;
    accessExpires: string;
    refreshExpires: string;
  };
  frontendUrl: string;
  nodeEnv: string;
}

export function configuration(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    database: {
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '',
      name: process.env.DB_NAME ?? 'hotel_booking',
    },
    redis: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
    },
    jwt: {
      privateKey: process.env.JWT_PRIVATE_KEY ?? '',
      publicKey: process.env.JWT_PUBLIC_KEY ?? '',
      accessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
      refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
    },
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    nodeEnv: process.env.NODE_ENV ?? 'development',
  };
}

export const envValidationSchema = Joi.object({
  PORT: Joi.number().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NAME: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  JWT_PRIVATE_KEY: Joi.string().required(),
  JWT_PUBLIC_KEY: Joi.string().required(),
  JWT_ACCESS_EXPIRES: Joi.string().required(),
  JWT_REFRESH_EXPIRES: Joi.string().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
});
