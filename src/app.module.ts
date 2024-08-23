import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import dbConfig from './common/config/db.config';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig],
    }),
    MongooseModule.forRootAsync({
      useFactory: dbConfig,
      
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
