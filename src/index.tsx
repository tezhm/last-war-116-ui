import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Authenticate } from "./components/authentication/Authenticate";
import { titles } from "./components/titles/Titles";
import { Login } from "./pages/Login";
import { Schedule } from "./pages/Schedule";
import { Signup } from "./pages/Signup";
import reportWebVitals from "./reportWebVitals";
import "./index.css";

export const theme = createTheme({
    typography: {
        fontFamily: [
            "Metropolis",
            "sans-serif",
        ].join(","),
    },
});

const root = createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" index element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<Authenticate />}>
                        <Route path={titles.secretaryOfStrategy.url} element={<Schedule username={"asdads"} title={titles.secretaryOfStrategy} />} />
                        <Route path={titles.secretaryOfSecurity.url} element={<Schedule username={"asdads"} title={titles.secretaryOfSecurity} />} />
                        <Route path={titles.secretaryOfDevelopment.url} element={<Schedule username={"asdads"} title={titles.secretaryOfDevelopment} />} />
                        <Route path={titles.secretaryOfScience.url} element={<Schedule username={"asdads"} title={titles.secretaryOfScience} />} />
                        <Route path={titles.secretaryOfInterior.url} element={<Schedule username={"asdads"} title={titles.secretaryOfInterior} />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
