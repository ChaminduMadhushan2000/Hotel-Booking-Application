import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EMAIL_QUEUE } from '../../common/constants/queue.constants';

interface OrderConfirmedPayload {
  orderId: string;
  customerEmail: string;
}

interface BookingConfirmationPayload {
  bookingId: string;
  userId: string;
  roomId: string;
}

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  public async process(job: Job): Promise<void> {
    try {
      if (job.name === 'send-order-confirmed') {
        const payload = job.data as OrderConfirmedPayload;
        await this._mockSendOrderConfirmed(payload);
        this.logger.log(
          `Processed job ${job.id} (${job.name}) for order ${payload.orderId}`,
        );
        return;
      }

      if (job.name === 'send-booking-confirmation') {
        const payload = job.data as BookingConfirmationPayload;
        this.logger.log(
          `Booking confirmation queued for booking ${payload.bookingId}`,
        );
        return;
      }

      if (job.name === 'send-otp') {
        this.logger.log(`OTP notification queued for job ${String(job.id)}`);
        return;
      }

      if (job.name === 'send-notification') {
        this.logger.log(`Generic notification queued for job ${String(job.id)}`);
        return;
      }

      this.logger.log(`Skipped unsupported job ${job.id} (${job.name})`);
    } catch (error: unknown) {
      this.logger.error(
        'job failed',
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private async _mockSendOrderConfirmed(
    payload: OrderConfirmedPayload,
  ): Promise<{ success: true; message: string; data: OrderConfirmedPayload }> {
    return {
      success: true,
      message: 'Mocked order confirmation email dispatch',
      data: payload,
    };
  }
}
