export interface UserInfo {
    isAdmin: boolean;
    inGameName: string;
    verificationCode: string;
}

export interface ScheduleInfo {
    // Interval in minutes
    slotInterval: number;
}

export interface ScheduledItem {
    timestamp: number;
    inGameName: string;
}

export interface Scheduled {
    info: ScheduleInfo;
    scheduled: ScheduledItem[];
}
