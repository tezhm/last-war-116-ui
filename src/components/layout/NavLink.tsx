import ListItemButton from "@mui/material/ListItemButton";
import { JSX, ReactNode } from "react";
import { Link } from "react-router-dom";

interface NavLinkItemProps {
    currentUrl: string;
    targetUrl: string;
    onClick?: () => void;
    children?: ReactNode;
}

export function NavLink(props: NavLinkItemProps): JSX.Element {
    if (props.currentUrl !== props.targetUrl) {
        return (
            <ListItemButton component={Link} to={props.targetUrl} onClick={props.onClick}>
                {props.children}
            </ListItemButton>
        );
    }

    return (
        <ListItemButton component={Link} to={props.targetUrl} onClick={props.onClick} sx={{ backgroundColor: (theme) =>
                theme.palette.mode === "light"
                    ? theme.palette.grey[100]
                    : theme.palette.grey[900] }}>
            {props.children}
        </ListItemButton>
    );
}
