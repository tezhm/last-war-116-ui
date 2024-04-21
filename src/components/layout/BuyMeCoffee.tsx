import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { JSX } from "react";

export function BuyMeCoffee(): JSX.Element {
    return (
        <Link href={"https://buymeacoffee.com/tezhm"}>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ pt: 4 }}>
                {"I did this for free but you're welcome to buy me a coffee ☕"}
            </Typography>
        </Link>
    );
}
