import { JSX } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Navigate, Outlet } from "react-router-dom";
import { ApiClient } from "../clients/ApiClient";
import { AccessTokenCache } from "./AccessTokenCache";

export function Authenticate(): JSX.Element {
    const accessToken = AccessTokenCache.getInstance().loadAccessToken();

    if (!accessToken) {
        ApiClient.getInstance().clearAccessToken();
        AccessTokenCache.getInstance().invalidate();
    } else {
        ApiClient.getInstance().setAccessToken(accessToken);
    }

    return (
        <ErrorBoundary fallback={<Navigate to="/login" />}>
            <Outlet />
        </ErrorBoundary>
    );
}
