import { SchedulerService } from './scheduler.service';
export declare class SchedulerController {
    private readonly schedulerService;
    constructor(schedulerService: SchedulerService);
    triggerExpirationCheck(): Promise<{
        checked: number;
        notified: number;
    }>;
    triggerOverdueCheck(): Promise<void>;
}
