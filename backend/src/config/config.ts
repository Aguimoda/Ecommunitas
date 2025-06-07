import dotenv from 'dotenv';
import { EnvironmentConfig } from '../../types/index';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URI',
  'JWT_SECRET',
  'FRONTEND_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Environment configuration
export const config: EnvironmentConfig = {
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URI: process.env.DATABASE_URI!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  JWT_COOKIE_EXPIRE: parseInt(process.env.JWT_COOKIE_EXPIRE || '30', 10),
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@ecommunitas.com',
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  FRONTEND_URL: process.env.FRONTEND_URL!
};

// Application settings
export const appConfig = {
  // Server settings
  server: {
    port: config.PORT,
    host: process.env.HOST || '0.0.0.0',
    cors: {
      origin: config.NODE_ENV === 'production' 
        ? [config.FRONTEND_URL]
        : ['http://localhost:3000', 'http://localhost:3001', config.FRONTEND_URL],
      credentials: true,
      optionsSuccessStatus: 200
    },
    helmet: {
      contentSecurityPolicy: config.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false
    }
  },
  
  // Database settings
  database: {
    uri: config.DATABASE_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    }
  },
  
  // JWT settings
  jwt: {
    secret: config.JWT_SECRET,
    expire: config.JWT_EXPIRE,
    cookieExpire: config.JWT_COOKIE_EXPIRE,
    cookieOptions: {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: config.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // Convert days to milliseconds
    }
  },
  
  // Email settings
  email: {
    from: config.EMAIL_FROM,
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    username: config.EMAIL_USERNAME,
    password: config.EMAIL_PASSWORD,
    secure: config.EMAIL_PORT === 465,
    templates: {
      welcome: 'welcome',
      resetPassword: 'reset-password',
      emailVerification: 'email-verification',
      itemApproved: 'item-approved',
      itemRejected: 'item-rejected',
      newMessage: 'new-message'
    }
  },
  
  // File upload settings
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 10,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedDocumentTypes: ['application/pdf', 'text/plain'],
    destinations: {
      avatars: 'uploads/avatars',
      items: 'uploads/items',
      messages: 'uploads/messages',
      temp: 'uploads/temp'
    }
  },
  
  // Rate limiting settings
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    // Different limits for different endpoints
    endpoints: {
      auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5 // 5 attempts per window
      },
      api: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // 100 requests per window
      },
      upload: {
        windowMs: 60 * 1000, // 1 minute
        max: 10 // 10 uploads per minute
      }
    }
  },
  
  // Pagination settings
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
    defaultPage: 1
  },
  
  // Search settings
  search: {
    maxDistance: 50000, // 50km in meters
    defaultDistance: 10000, // 10km in meters
    textSearchLimit: 50
  },
  
  // Cache settings
  cache: {
    defaultTTL: 300, // 5 minutes
    userTTL: 600, // 10 minutes
    itemTTL: 300, // 5 minutes
    searchTTL: 180 // 3 minutes
  },
  
  // Security settings
  security: {
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    lockoutTime: 30 * 60 * 1000, // 30 minutes
    passwordResetExpire: 10 * 60 * 1000, // 10 minutes
    emailVerificationExpire: 24 * 60 * 60 * 1000, // 24 hours
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    csrfProtection: config.NODE_ENV === 'production'
  },
  
  // Logging settings
  logging: {
    level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    format: config.NODE_ENV === 'production' ? 'json' : 'simple',
    file: {
      enabled: config.NODE_ENV === 'production',
      filename: 'logs/app.log',
      maxSize: '20m',
      maxFiles: '14d'
    },
    console: {
      enabled: true,
      colorize: config.NODE_ENV !== 'production'
    }
  },
  
  // Feature flags
  features: {
    emailVerification: true,
    phoneVerification: false,
    twoFactorAuth: false,
    geolocation: true,
    realTimeMessages: true,
    pushNotifications: false,
    analytics: config.NODE_ENV === 'production',
    maintenance: false
  },
  
  // API settings
  api: {
    version: 'v1',
    prefix: '/api/v1',
    documentation: {
      enabled: config.NODE_ENV !== 'production',
      path: '/api-docs'
    }
  },
  
  // Monitoring settings
  monitoring: {
    healthCheck: {
      enabled: true,
      path: '/health',
      interval: 30000 // 30 seconds
    },
    metrics: {
      enabled: config.NODE_ENV === 'production',
      path: '/metrics'
    }
  }
};

// Validation functions
export const validateConfig = (): boolean => {
  try {
    // Validate JWT secret strength
    if (config.JWT_SECRET.length < 32) {
      console.warn('JWT_SECRET should be at least 32 characters long');
    }
    
    // Validate database URI format
    if (!config.DATABASE_URI.startsWith('mongodb://') && !config.DATABASE_URI.startsWith('mongodb+srv://')) {
      throw new Error('DATABASE_URI must be a valid MongoDB connection string');
    }
    
    // Validate port range
    if (config.PORT < 1 || config.PORT > 65535) {
      throw new Error('PORT must be between 1 and 65535');
    }
    
    // Validate frontend URL
    try {
      new URL(config.FRONTEND_URL);
    } catch {
      throw new Error('FRONTEND_URL must be a valid URL');
    }
    
    return true;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    return false;
  }
};

// Get configuration for specific environment
export const getEnvConfig = (env: string = config.NODE_ENV) => {
  const envConfigs = {
    development: {
      ...appConfig,
      logging: {
        ...appConfig.logging,
        level: 'debug'
      },
      security: {
        ...appConfig.security,
        csrfProtection: false
      }
    },
    production: {
      ...appConfig,
      logging: {
        ...appConfig.logging,
        level: 'info'
      },
      security: {
        ...appConfig.security,
        csrfProtection: true
      }
    },
    test: {
      ...appConfig,
      database: {
        ...appConfig.database,
        uri: process.env.TEST_DATABASE_URI || config.DATABASE_URI + '_test'
      },
      logging: {
        ...appConfig.logging,
        level: 'error'
      }
    }
  };
  
  return envConfigs[env as keyof typeof envConfigs] || envConfigs.development;
};

export default config;