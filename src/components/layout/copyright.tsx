import Typography from "@mui/material/Typography";
import { JSX } from "react";

export function Copyright(): JSX.Element {
    return (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ pt: 4 }}>
            {"Copyright \u00A9 " + new Date().getFullYear() + " Tomilion Pty Ltd. All Rights Reserved"}
        </Typography>
    );
}
