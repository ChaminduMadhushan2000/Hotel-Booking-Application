import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { IMAGE_QUEUE } from '../../common/constants/queue.constants';

@Processor(IMAGE_QUEUE)
export class ImageProcessor extends WorkerHost {
  private readonly logger = new Logger(ImageProcessor.name);

  public async process(job: Job): Promise<void> {
    this.logger.log(`Processed image queue job ${String(job.id)} (${job.name})`);
  }
}
