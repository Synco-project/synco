import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly chatId: string;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
    
    this.enabled = !!(this.botToken && this.chatId);
    
    if (this.enabled) {
      this.logger.log('Telegram Alerting is ENABLED.');
    } else {
      this.logger.warn('Telegram Alerting is DISABLED. (Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID)');
    }
  }

  async sendMessage(text: string): Promise<boolean> {
    if (!this.enabled) return false;

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    
    try {
      await axios.post(url, {
        chat_id: this.chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
      return true;
    } catch (error: any) {
      const details = error.response?.data?.description || error.message;
      this.logger.error(`Failed to send Telegram message: ${details}`);
      return false;
    }
  }
}
