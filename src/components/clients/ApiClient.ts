import { app } from "../../config/app";
import { Scheduled } from "./types";

export class ApiClient {
    private static instance: ApiClient|null = null;
    private accessToken: string|null = null;

    public static getInstance(): ApiClient {
        if (ApiClient.instance === null) {
            ApiClient.instance = new ApiClient();
        }

        return ApiClient.instance;
    }

    public setAccessToken(accessToken: string): void {
        this.accessToken = accessToken;
    }

    public clearAccessToken(): void {
        this.accessToken = null;
    }

    public async queryScheduled(title: string, start: number, end: number): Promise<Scheduled> {
        const response = await this.fetch(`/v1/schedule/${title}/index`, { start, end });

        if (!response) {
            throw new Error(`Failed to query scheduled for ${title}`);
        }

        return await response.json();
    }

    private async fetch(url: string, params?: Record<string, any>): Promise<Response|null> {
        try {
            const result = await fetch(`${app.API_URL}${url}?_at=${this.getAccessToken()}${this.parseParams(params)}`);

            // Pre-flight can return successfully when failing authentication
            if (!result.ok) {
                if (result.status === 401) {

                }

                return null;
            }

            return result;
        } catch (error) {
            return null;
        }
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
        if (this.accessToken === null) {
            throw new Error("Access token not set");
        }

        return this.accessToken;
    }
}
