import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Toolbar from "@mui/material/Toolbar";
import { JSX, useEffect, useState } from "react";
import { Copyright } from "../components/layout/copyright";
import { NavBar } from "../components/layout/navbar";
import { Title } from "../components/titles/titles";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "rgba(0, 0, 0, 0.74)",
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td, &:last-child th": {
        border: 0,
    },
    cursor: "pointer",
}));

function defaultRows(stepSize: number): ScheduleRow[] {
    const oneDayInMins = 24 * 60 * 60 * 1000;
    const localTime = new Date();
    localTime.setMinutes(Math.floor(localTime.getMinutes() / 15) * 15, 0);
    const startTime = localTime.getTime();

    let rows: ScheduleRow[] = [];

    for (let i = 0; i < oneDayInMins; i += stepSize) {
        const time = new Date(startTime + i);
        rows.push({
            timestamp: time.getTime(),
            dateString: time.toLocaleDateString(),
            timeString: time.toTimeString().substring(0, 8),
            account: null,
        });
    }

    return rows;
}

interface ScheduleProps {
    title: Title;
}

interface ScheduleRow {
    timestamp: number;
    dateString: string;
    timeString: string;
    account: string|null;
}

interface ScheduleState {
    rows: ScheduleRow[];
}

export function Schedule(props: ScheduleProps): JSX.Element {
    const [state, setState] = useState<ScheduleState>({
        rows: defaultRows(15 * 60 * 1000),
    });
    const timezone = (new Date()).toTimeString().substring(9);

    useEffect(() => {
        const currentTime = new Date();
        currentTime.setSeconds(0, 0);
        currentTime.setMinutes(Math.floor(currentTime.getMinutes() / 15) * 15);
        const closest15Minute = currentTime.toTimeString().substring(0, 5);
        const elements = document.getElementsByTagName("span");

        // Manually scrolling current time into view because library doesn't support it
        for (const element of Array.from(elements)) {
            if (element.innerText === closest15Minute) {
                let initialisedView = false;
                const observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach((entry) => {
                        if (!initialisedView) {
                            element.scrollIntoView({ block: "start", inline: "start", behavior: "smooth" });
                            observer.disconnect();
                            initialisedView = true;
                        }
                    });
                }, { root: null, threshold: 0.5 });
                observer.observe(element);
            }
        }
    });

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <NavBar pageTitle={props.title.name} />
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
                    <Paper sx={{ width: "100%", mb: 2, overflow: "hidden" }}>
                        <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 200px)" }}>
                            <Table stickyHeader size="small">
                                <TableHead >
                                    <TableRow>
                                        <StyledTableCell>{`Time: ${timezone}`}</StyledTableCell>
                                        <StyledTableCell>Commander</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {state.rows.map((row, index) => (
                                        <StyledTableRow key={row.timestamp} hover>
                                            <TableCell component="th" scope="row">
                                                <i>{row.dateString}</i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{row.timeString}
                                            </TableCell>
                                            <TableCell>{row.account ?? "Select"}</TableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                    <Copyright />
                </Container>
            </Box>
        </Box>
    );
}
