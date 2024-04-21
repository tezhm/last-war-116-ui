import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import { JSX, ReactNode } from "react";
import { BuyMeCoffee } from "./BuyMeCoffee";
import { NavBar } from "./NavBar";

interface DashboardProps {
    pageTitle: string;
    currentUrl: string;
    children?: ReactNode;
}

export function Dashboard(props: DashboardProps): JSX.Element {
    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <NavBar pageTitle={props.pageTitle} currentUrl={props.currentUrl} />
            <Box
                component="main"
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === "light"
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                    flexGrow: 1,
                    height: "100vh",
                    overflow: "auto",
                }}
            >
                <Toolbar />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    {props.children}
                    <BuyMeCoffee />
                </Container>
            </Box>
        </Box>
    );
}
