export const ACCESS_TOKEN_KEY: string = "_at";

export class AccessTokenCache {
    private static instance: AccessTokenCache|null = null;
    private accessToken: string|null = null;
    private loaded: boolean = false;

    public static getInstance(): AccessTokenCache {
        if (AccessTokenCache.instance === null) {
            AccessTokenCache.instance = new AccessTokenCache();
        }

        return AccessTokenCache.instance;
    }

    public update(accessToken: string): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        this.accessToken = accessToken;
        this.loaded = true;
    }

    public invalidate(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        this.accessToken = null;
        this.loaded = false;
    }

    public loadAccessToken(): string|null {
        if (this.loaded) {
            return this.accessToken;
        }

        const searchParams: URLSearchParams = new URLSearchParams(window.location.search);

        // Checking url for access token
        if (searchParams.has(ACCESS_TOKEN_KEY)) {
            const accessToken = searchParams.get(ACCESS_TOKEN_KEY);

            if (accessToken) {
                this.update(accessToken);
                return accessToken;
            }
        }

        // Relying on local storage when no access token in url
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

        if (!accessToken) {
            return null;
        }

        this.update(accessToken);
        return accessToken;
    }
}
