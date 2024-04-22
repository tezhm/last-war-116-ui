import { app } from "../../config/app";
import { AccessTokenCache } from "../authentication/AccessTokenCache";
import { Scheduled, UserInfo } from "./types";

export class ApiClient {
    private static instance: ApiClient|null = null;

    public static getInstance(): ApiClient {
        if (ApiClient.instance === null) {
            ApiClient.instance = new ApiClient();
        }

        return ApiClient.instance;
    }

    public async queryUserInfo(): Promise<UserInfo> {
        const response = await this.authFetch("/v1/user/info");

        if (!response) {
            throw new Error("Failed to query user info");
        }

        return await response.json();
    }

    public async queryScheduled(title: string, start: number, end: number): Promise<Scheduled> {
        const response = await this.authFetch(`/v1/schedule/${title}/index`, { start, end });

        if (!response) {
            throw new Error(`Failed to query scheduled for ${title}`);
        }

        return await response.json();
    }

    public async login(username: string, token: string): Promise<string> {
        const response = await this.post(`/v1/login`, undefined, { username, token });

        if (!response) {
            throw new Error(`Failed to login`);
        }

        return (await response.json()).accessToken;
    }

    public async subscribe(username: string, otpAuthCode: string, inGameName: string): Promise<{ accessToken: string, verificationCode: string }> {
        const response = await this.post(`/v1/subscribe`, undefined, { username, inGameName, otpAuthCode });

        if (!response) {
            throw new Error(`Failed to sign up`);
        }

        return await response.json();
    }

    public async reserve(title: string, timestamp: number): Promise<void> {
        const response = await this.authPost(`/v1/schedule/${title}/reserve/${timestamp}`);

        if (!response) {
            throw new Error(`Failed to reserve ${title} at ${timestamp}`);
        }
    }

    public async cancel(title: string, timestamp: number): Promise<void> {
        const response = await this.authPost(`/v1/schedule/${title}/cancel/${timestamp}`);

        if (!response) {
            throw new Error(`Failed to cancel ${title} at ${timestamp}`);
        }
    }

    public async changeInGameName(inGameName: string): Promise<void> {
        const response = await this.authPost("/v1/user/change-in-game-name", undefined, { inGameName });

        if (!response) {
            throw new Error("Failed to change in game name");
        }
    }

    public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        const response = await this.authPost("/v1/user/change-password", undefined, { currentPassword, newPassword });

        if (!response) {
            throw new Error("Failed to change password");
        }
    }

    private async authFetch(url: string, params?: Record<string, any>): Promise<Response|null> {
        try {
            return await this.fetch(`${app.API_URL}${url}?_at=${this.getAccessToken()}${this.parseParams(params)}`);
        } catch {
            return null;
        }
    }

    private async authPost(url: string, params?: Record<string, any>, data?: object): Promise<Response> {
        return await this.fetch(`${app.API_URL}${url}?_at=${this.getAccessToken()}${this.parseParams(params)}`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(data),
        });
    }

    private async post(url: string, params?: Record<string, any>, data?: object): Promise<Response> {
        const init = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(data),
        };

        if (params && Object.keys(params).length > 0) {
            return await this.fetch(`${app.API_URL}${url}?${this.parseParams(params).substring(1)}`, init);
        }

        return await this.fetch(`${app.API_URL}${url}`, init);
    }

    private async fetch(url: string, init?: RequestInit): Promise<Response> {
        const response = await fetch(url, init);

        // Pre-flight can return successfully when failing authentication
        if (!response.ok) {
            if (response.status === 401) {
                AccessTokenCache.getInstance().invalidate();
                window.location.href = "/login";
            }

            const errors = await this.decodeResponse(response);

            if (errors?.errors?.length !== 0) {
                throw new Error(errors.errors[0].msg);
            }

            throw new Error("Unknown error");
        }

        return response;
    }

    private parseParams(params?: Record<string, any>): string {
        if (!params) {
            return "";
        }

        let paramString = "";

        for (const param in params) {
            paramString += `&${param}=${params[param]}`
        }

        return paramString;
    }

    private getAccessToken(): string {
        const accessToken = AccessTokenCache.getInstance().loadAccessToken();

        if (accessToken === null) {
            throw new Error("Access token not set");
        }

        return accessToken;
    }

    private async decodeResponse(response: Response): Promise<any|null> {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }
}
