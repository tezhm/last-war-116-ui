import Alert from "@mui/material/Alert";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Fade from "@mui/material/Fade";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { JSX, useEffect, useState } from "react";
import { ApiClient } from "../components/clients/ApiClient";
import { Dashboard } from "../components/layout/Dashboard";
import { Title } from "../components/titles/Titles";

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

const SelectedRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: theme.palette.success.light,
    "&:last-child td, &:last-child th": {
        border: 0,
    },
    cursor: "pointer",
}));

const ReservedRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: theme.palette.action.disabled,
    "&:last-child td, &:last-child th": {
        border: 0,
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
    const stepSizeMins = stepSize / 60 / 1000;
    const oneDayInMillis = 24 * 60 * 60 * 1000;
    const currentTime = new Date();
    currentTime.setMinutes(Math.floor(currentTime.getMinutes() / stepSizeMins) * stepSizeMins, 0, 0);
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
    inGameName: string|null;
    rows: ScheduleRow[];
    loading: boolean;
    showReserveDialog: boolean;
    reserveSettings: {
        index: number;
        timestamp: number;
        timeString: string;
    }|null;
    showCancelDialog: boolean;
    cancelSettings: {
        index: number;
        timestamp: number;
        timeString: string;
    }|null;
    snackbar: {
        children?: JSX.Element;
        message?: string;
        autoHideDuration?: number;
    }|null;
}

export function Schedule(props: ScheduleProps): JSX.Element {
    const [state, setState] = useState<ScheduleState>({
        inGameName: null,
        rows: [],
        loading: true,
        showReserveDialog: false,
        reserveSettings: null,
        showCancelDialog: false,
        cancelSettings: null,
        snackbar: null,
    });

    useEffect(() => {
        setState((state) => ({ ...state, rows: [], loading: true }));

        const currentTime = new Date();
        currentTime.setMinutes(0, 0, 0);
        const start = currentTime.getTime();
        const end = start + (25 * 60 * 60 * 1000);

        ApiClient.getInstance().queryScheduled(props.title.id, start, end).then((scheduled) => {
            const stepSize = scheduled.info.slotInterval * 60 * 1000;
            const rows = defaultRows(stepSize);
            const startTime = rows[0].timestamp;

            for (const schedule of scheduled.scheduled) {
                const index = (schedule.timestamp - startTime) / stepSize;

                if (!rows[index] || rows[index].timestamp !== schedule.timestamp) {
                    continue;
                }

                rows[index].account = schedule.inGameName;
            }

            setState((state) => ({ ...state, rows: rows, loading: false }));
        });

        ApiClient.getInstance().queryUserInfo().then((userInfo) => {
            setState((state) => ({ ...state, inGameName: userInfo.inGameName }));
        });
    }, [props]);

    const indicatorSize = 80;

    return (
        <Dashboard pageTitle={props.title.name} currentUrl={props.title.url}>
            <Paper sx={{
                width: "100%",
                mb: 2,
                overflow: "hidden",
                height: "calc(100vh - 200px)"
            }}>
                <Modal
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    open={state.loading}
                    closeAfterTransition
                    slots={{ backdrop: Backdrop }}
                    slotProps={{
                      backdrop: {
                        timeout: 500,
                      },
                    }}
                    disableAutoFocus={true}
                >
                    <Fade in={state.loading}>
                        <CircularProgress
                            sx={{
                                color: "white",
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                marginTop: `${-indicatorSize / 2}px`,
                                marginLeft: `${-indicatorSize / 2}px`
                            }}
                        />
                    </Fade>
                </Modal>
                <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 200px)" }}>
                    <Table stickyHeader size="small">
                        <TableHead >
                            <TableRow>
                                <HeaderCell>{`Time: ${timezone}`}</HeaderCell>
                                <HeaderCell align={"center"}>Commander</HeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            { state.rows.map((row, index) => (row.account === null) ?
                                <BodyRow key={row.timestamp} hover onClick={() => setState((state) => ({
                                    ...state,
                                    showReserveDialog: true,
                                    reserveSettings: {
                                        index: index,
                                        timestamp: row.timestamp,
                                        timeString: row.timeString
                                    },
                                }))}>
                                    <TableCell component="th" scope="row">
                                        <i>{row.dateString}</i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{row.timeString}
                                    </TableCell>
                                    <TableCell align={"center"}></TableCell>
                                </BodyRow> : row.account === state.inGameName ?
                                    <SelectedRow key={row.timestamp} onClick={() => setState((state) => ({
                                        ...state,
                                        showCancelDialog: true,
                                        cancelSettings: {
                                            index: index,
                                            timestamp: row.timestamp,
                                            timeString: row.timeString
                                        },
                                    }))}>
                                        <TableCell component="th" scope="row">
                                            <i>{row.dateString}</i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{row.timeString}
                                        </TableCell>
                                        <TableCell align={"center"}>{row.account}</TableCell>
                                    </SelectedRow> :
                                    <ReservedRow key={row.timestamp}>
                                        <TableCell component="th" scope="row">
                                            <i>{row.dateString}</i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{row.timeString}
                                        </TableCell>
                                        <TableCell align={"center"}>{row.account}</TableCell>
                                    </ReservedRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <Dialog open={state.showReserveDialog} onClose={() => setState({ ...state, showReserveDialog: false })}>
                <DialogContent>
                    <DialogContentText>
                        Reserve {props.title.name} at {state.reserveSettings?.timeString}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={async () => {
                        setState((state) => ({ ...state, showReserveDialog: false, loading: true }));

                        if (state.reserveSettings?.timestamp) {
                            try {
                                await ApiClient.getInstance().reserve(props.title.id, state.reserveSettings?.timestamp);
                                setState((state) => {
                                    state.rows[state.reserveSettings?.index ?? -1].account = state.inGameName;
                                    return { ...state, loading: false };
                                });
                            } catch (error) {
                                setState((state) => ({
                                    ...state,
                                    loading: false,
                                    snackbar: {
                                        children: <Alert severity="error" variant="filled" sx={{ width: "100%" }}>{String(error)}</Alert>,
                                    },
                                }));
                            }
                        }
                    }}>Yes</Button>
                    <Button onClick={() => setState({ ...state, showReserveDialog: false })}>No</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={state.showCancelDialog} onClose={() => setState({ ...state, showCancelDialog: false })}>
                <DialogContent>
                    <DialogContentText>
                        Cancel {props.title.name} at {state.cancelSettings?.timeString}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={async () => {
                        setState((state) => ({ ...state, showCancelDialog: false, loading: true }));

                        if (state.cancelSettings?.timestamp) {
                            try {
                                await ApiClient.getInstance().cancel(props.title.id, state.cancelSettings?.timestamp);
                                setState((state) => {
                                    state.rows[state.cancelSettings?.index ?? -1].account = null;
                                    return { ...state, loading: false };
                                });
                            } catch (error) {
                                setState((state) => ({
                                    ...state,
                                    loading: false,
                                    snackbar: {
                                        children: <Alert severity="error" variant="filled" sx={{ width: "100%" }}>{String(error)}</Alert>,
                                    },
                                }));
                            }
                        }
                    }}>Yes</Button>
                    <Button onClick={() => setState({ ...state, showCancelDialog: false })}>No</Button>
                </DialogActions>
            </Dialog>
            <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                      open={!!state.snackbar}
                      onClose={() => setState({ ...state, snackbar: null })}
                      message={state.snackbar?.message}
                      autoHideDuration={state.snackbar?.autoHideDuration}>
                {state.snackbar?.children}
            </Snackbar>
        </Dashboard>
    );
}
