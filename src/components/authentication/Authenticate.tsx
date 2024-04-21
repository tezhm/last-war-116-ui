import { JSX } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { ApiClient } from "../clients/ApiClient";

const ACCESS_TOKEN_KEY: string = "_at";

function loadAccessToken(): string|null {
    const searchParams: URLSearchParams = new URLSearchParams(window.location.search);

    // Checking url for access token
    if (searchParams.has(ACCESS_TOKEN_KEY)) {
        const accessToken = searchParams.get(ACCESS_TOKEN_KEY);

        if (accessToken) {
            localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
            return accessToken;
        }
    }

    // Relying on local storage when no access token in url
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function Authenticate(): JSX.Element {
    const navigate = useNavigate();
    const accessToken = loadAccessToken();

    if (!accessToken) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        ApiClient.getInstance().clearAccessToken();
        navigate("/login");
    } else {
        ApiClient.getInstance().setAccessToken(accessToken);
    }

    return (
        <ErrorBoundary fallback={<Navigate to="/login" />}>
            <Outlet />
        </ErrorBoundary>
    );
}
