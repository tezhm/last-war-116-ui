import { JSX } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Navigate, Outlet } from "react-router-dom";
import { AccessTokenCache } from "./AccessTokenCache";

export function Authenticate(): JSX.Element {
    const accessToken = AccessTokenCache.getInstance().loadAccessToken();

    if (!accessToken) {
        AccessTokenCache.getInstance().invalidate();
        return <Navigate to="/login" />;
    }

    return (
        <ErrorBoundary fallback={<Navigate to="/login" />} onError={() => AccessTokenCache.getInstance().invalidate()}>
            <Outlet />
        </ErrorBoundary>
    );
}
