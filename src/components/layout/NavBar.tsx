import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from '@mui/icons-material/Settings';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Fragment, JSX, useState } from "react";
import { titles } from "../titles/Titles";
import { NavLink } from "./NavLink";

const drawerWidth: number = 290;

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
        "& .MuiDrawer-paper": {
            position: "relative",
            whiteSpace: "nowrap",
            width: drawerWidth,
            transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: "border-box",
            ...(!open && {
                overflowX: "hidden",
                transition: theme.transitions.create("width", {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
            }),
        },
    }),
);

interface NavBarProps {
    pageTitle: string;
    currentUrl: string;
}

interface NavBarState {
    open: boolean;
    isAdmin: boolean;
}

export function NavBar(props: NavBarProps): JSX.Element {
    const [state, setState] = useState<NavBarState>({ open: false, isAdmin: true });

    return (
        <Fragment>
            <AppBar position="absolute" open={state.open}>
                <Toolbar
                    sx={{
                        pr: "24px", // keep right padding when drawer closed
                    }}
                >
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={() => setState({ ...state, open: !state.open })}
                        sx={{
                            marginRight: "36px",
                            ...(state.open && { display: "none" }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        noWrap
                        sx={{ flexGrow: 1 }}
                    >
                        {props.pageTitle}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={state.open}>
                <Toolbar
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        px: [1],
                    }}
                >
                    <IconButton onClick={() => setState({ ...state, open: !state.open })}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Toolbar>
                <Divider />
                <List component="nav">
                    {Object.keys(titles).map((title, index) => {
                        return (
                            <NavLink currentUrl={props.currentUrl} targetUrl={titles[title].url} key={index}>
                                <ListItemIcon>{titles[title].icon}</ListItemIcon>
                                <ListItemText primary={titles[title].name} />
                            </NavLink>
                        );
                    })}
                    {state.isAdmin ?
                        <Fragment>
                            <Divider />
                            <NavLink currentUrl={props.currentUrl} targetUrl="/verification">
                                <ListItemIcon><FingerprintIcon /></ListItemIcon>
                                <ListItemText primary="Verification" />
                            </NavLink>
                        </Fragment> : null
                    }
                    <Divider />
                    <NavLink currentUrl={props.currentUrl} targetUrl="/secretary-of-interior">
                        <ListItemIcon><SettingsIcon /></ListItemIcon>
                        <ListItemText primary="Settings" />
                    </NavLink>
                    <NavLink currentUrl={props.currentUrl} targetUrl="/secretary-of-interior">
                        <ListItemIcon><LogoutIcon /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </NavLink>
                </List>
            </Drawer>
        </Fragment>
    );
}
