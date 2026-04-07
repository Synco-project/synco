import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { AppsService } from '../apps/apps.service';
import { ChecksService } from '../checks/checks.service';
import { EventsGateway } from '../events/events.gateway';
import { PingService } from './ping.service';
import { TelegramService } from '../notifications/telegram.service';
import { App } from '../apps/app.entity';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly appsService: AppsService,
    private readonly checksService: ChecksService,
    private readonly eventsGateway: EventsGateway,
    private readonly configService: ConfigService,
    private readonly pingService: PingService,
    private readonly telegramService: TelegramService,
  ) { }

  @Cron('*/10 * * * * *')
  async handleCron() {
    try {
      const apps = await this.appsService.findActive();
      const now = new Date();

      for (const app of apps) {
        if (this.shouldPingApp(app, now)) {
          this.pingApp(app).catch(err => this.logger.error(`Error procesando ping para ${app.name}: ${err.message}`));
        }
      }
    } catch (error: any) {
      this.logger.error(`Error crítico obteniendo apps activas en Cron: ${error.message}`);
    }
  }

  private shouldPingApp(app: App, now: Date): boolean {
    if (!app.lastCheck) return true;

    const diffInSeconds = (now.getTime() - app.lastCheck.getTime()) / 1000;
    const interval = this.calculateDynamicInterval(app);

    return diffInSeconds >= interval;
  }

  private calculateDynamicInterval(app: App): number {
    if (app.failureCount > 0) {
      return 30;
    }
    return Math.floor(Math.random() * (300 - 240 + 1)) + 240;
  }

  private async pingApp(app: App) {
    const timeout = this.configService.get<number>('AXIOS_TIMEOUT') || 5000;
    const { success, statusCode, responseTime } = await this.pingService.executePing(app.url, timeout);

    app.lastCheck = new Date();

    const safeName = this.escapeHtml(app.name);
    const safeUrl = this.escapeHtml(app.url);
    const safeStatus = this.escapeHtml(statusCode?.toString() || 'Timeout/Network');

    if (success) {
      if (app.failureCount > 0) {
        let upMsg = `🟢 <b>SYSTEM RECOVERED</b>\n\n`;
        upMsg += `<b>Service:</b> ${safeName}\n`;
        upMsg += `<b>URL:</b> <a href="${app.url}">${safeUrl}</a>\n`;
        upMsg += `<b>Current status:</b> <code>OPERATIONAL</code>\n`;
        upMsg += `<b>Failed attempts:</b> ${app.failureCount}\n`;
        upMsg += `\n<i>The monitoring system has returned to its standard frequency..</i>`;
        this.telegramService.sendMessage(upMsg);
      }
      app.failureCount = 0;
    } else {
      if (app.failureCount === 0) {
        let downMsg = `🔴 <b>INCIDENCE DETECTED</b>\n\n`;
        downMsg += `<b>Service:</b> ${safeName}\n`;
        downMsg += `<b>URL:</b> <a href="${app.url}">${safeUrl}</a>\n`;
        downMsg += `<b>Current status:</b> <code>INACCESSIBLE</code>\n`;
        downMsg += `\n<i>The radar will begin high-frequency checks.</i>`;
        this.telegramService.sendMessage(downMsg);
      }
      app.failureCount += 1;
    }

    try {
      await this.appsService.update(app.id, {
        failureCount: app.failureCount,
        lastCheck: app.lastCheck,
      });

      await this.checksService.create(app, success, responseTime, statusCode);
    } catch (dbError: any) {
      this.logger.error(`Error guardando resultados del check de ${app.name} en BD: ${dbError.message}`);
    }

    try {
      const payload = {
        status: success ? 'up' as const : 'down' as const,
        lastCheck: new Date(app.lastCheck).toLocaleString(),
        failureCount: app.failureCount,
      };
      this.eventsGateway.emitAppUpdate(app.id, payload);
    } catch (wsError: any) {
      this.logger.error(`Error emitiendo evento WebSocket para ${app.name}: ${wsError.message}`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async hourlySummary() {
    try {
      const apps = await this.appsService.findActive();
      const total = apps.length;
      if (total === 0) return;

      const upApps = apps.filter(a => a.failureCount === 0).length;
      const downApps = total - upApps;

      let message = `📊 <b>INFRASTRUCTURE REPORT</b>\n`;
      message += `📅 <i>Generated: ${new Date().toLocaleString()}</i>\n\n`;
      message += `<b>General Summary:</b>\n`;
      message += `• Monitored Services: <b>${total}</b>\n`;
      message += `• Operating Nodes: <b>${upApps}</b> 🟢\n`;
      message += `• Inaccessible Nodes: <b>${downApps}</b> 🔴\n`;

      if (downApps > 0) {
        message += `\n<b>⚠️ Open Alerts:</b>\n`;
        apps.filter(a => a.failureCount > 0).forEach(a => {
          message += `   - <b>${this.escapeHtml(a.name)}</b> <i>(Consecutive failures: ${a.failureCount})</i>\n`;
        });
      } else {
        message += `\n✅ <i>All systems are operating within normal and healthy parameters.</i>`;
      }

      await this.telegramService.sendMessage(message);
    } catch (error: any) {
      this.logger.error(`Error sending schedule summary: ${error.message}`, error.stack);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldChecks() {
    this.logger.log('Starting midnight cleanup of old check records...');
    try {
      const deletedCount = await this.checksService.deleteOldChecks(2);
      this.logger.log(`Cleanup complete. Deleted ${deletedCount} records older than 2 days.`);
    } catch (error: any) {
      this.logger.error(`Error during DB checks cleanup: ${error.message}`, error.stack);
    }
  }

  private escapeHtml(text: string): string {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
