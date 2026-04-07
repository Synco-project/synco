import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { PingService } from './ping.service';
import { AppsModule } from '../apps/apps.module';
import { ChecksModule } from '../checks/checks.module';
import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AppsModule, ChecksModule, EventsModule, NotificationsModule],
  providers: [SchedulerService, PingService],
})
export class SchedulerModule {}
