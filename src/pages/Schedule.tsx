import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { JSX, useEffect, useState } from "react";
import { Dashboard } from "../components/layout/Dashboard";
import { Title } from "../components/titles/Titles";
import { ApiClient } from "../components/clients/ApiClient";

const timezone = (new Date()).toTimeString().substring(9);

const HeaderCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "rgba(0, 0, 0, 0.74)",
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const BodyRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td, &:last-child th": {
        border: 0,
    },
    cursor: "pointer",
}));

function defaultRows(stepSize: number): ScheduleRow[] {
    const oneDayInMillis = 24 * 60 * 60 * 1000;
    const currentTime = new Date();
    currentTime.setMinutes(Math.floor(currentTime.getMinutes() / 15) * 15, 0);
    const startTime = currentTime.getTime();

    let rows: ScheduleRow[] = [];

    for (let i = 0; i < oneDayInMillis; i += stepSize) {
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
    loading: boolean;
}

export function Schedule(props: ScheduleProps): JSX.Element {
    const [state, setState] = useState<ScheduleState>({
        rows: [],
        loading: true,
    });

    useEffect(() => {
        const currentTime = new Date();
        const start = currentTime.getTime();
        const end = start + (24 * 60 * 60 * 1000);

        ApiClient.getInstance().queryScheduled(props.title.id, start, end).then((scheduled) => {
            const rows = defaultRows(scheduled.info.slotInterval * 60 * 1000);
            setState({ rows: rows, loading: false });
        });
    }, [props]);

    return (
        <Dashboard pageTitle={props.title.name} currentUrl={props.title.url}>
            <Paper sx={{ width: "100%", mb: 2, overflow: "hidden", height: "calc(100vh - 200px)" }}>
                <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 200px)" }}>
                    <Table stickyHeader size="small">
                        <TableHead >
                            <TableRow>
                                <HeaderCell>{`Time: ${timezone}`}</HeaderCell>
                                <HeaderCell>Commander</HeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {state.rows.map((row, index) => (row.account === null) ?
                                <BodyRow key={row.timestamp} hover>
                                    <TableCell component="th" scope="row">
                                        <i>{row.dateString}</i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{row.timeString}
                                    </TableCell>
                                    <TableCell>Reserve</TableCell>
                                </BodyRow> :
                                <BodyRow key={row.timestamp}>
                                    <TableCell component="th" scope="row">
                                        <i>{row.dateString}</i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{row.timeString}
                                    </TableCell>
                                    <TableCell>row.account</TableCell>
                                </BodyRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Dashboard>
    );
}
