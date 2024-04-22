import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Container from "@mui/material/Container";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import qrcode from "qrcode";
import { ChangeEvent, FormEvent, JSX, useEffect, useRef, useState } from "react";
import { ApiClient } from "../components/clients/ApiClient";
import { Dashboard } from "../components/layout/Dashboard";
import { Link } from "react-router-dom";

interface SettingsState {
    inGameName: string|null;
    verificationCode: string|null;
    isVerified: boolean;
    otpAuthCode: string|null;
    snackbar: {
        children?: JSX.Element;
        message?: string;
        autoHideDuration?: number;
    }|null;
}

export function Settings(): JSX.Element {
    const [state, setState] = useState<SettingsState>({
        inGameName: null,
        verificationCode: null,
        isVerified: false,
        otpAuthCode: null,
        snackbar: null,
    });
    const [inGameNameFormData, setInGameNameFormData] = useState({
        inGameName: "",
    });
    const [inGameNameErrors, setInGameNameErrors] = useState({
        inGameName: "",
    });
    const canvasRef = useRef(null);

    useEffect(() => {
        ApiClient.getInstance().queryUserInfo().then((userInfo) => {
            setState((state) => ({
                ...state,
                inGameName: userInfo.inGameName,
                verificationCode: userInfo.verificationCode,
                otpAuthCode: userInfo.otpAuthCode,
            }));
        });
    }, []);

    useEffect(() => {
        if (state.otpAuthCode && canvasRef.current) {
            qrcode.toCanvas(canvasRef.current, state.otpAuthCode);
        }
    }, [state.otpAuthCode]);

    const validateInGameName = () => {
        if (!inGameNameFormData.inGameName || inGameNameFormData.inGameName.length < 2 || inGameNameFormData.inGameName.length > 20) {
            setInGameNameErrors({ inGameName: "Account name must be between 2 and 20 characters in length" });
            return false;
        }

        if (inGameNameFormData.inGameName === state.inGameName) {
            setInGameNameErrors({ inGameName: "No changes detected" });
            return false;
        }

        setInGameNameErrors({ inGameName: "" });
        return true;
    };

    const changeInGameName = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (validateInGameName()) {
            try {
                await ApiClient.getInstance().changeInGameName(inGameNameFormData.inGameName);
                const userInfo = await ApiClient.getInstance().queryUserInfo();
                setState((state) => ({
                    ...state,
                    inGameName: userInfo.inGameName,
                    verificationCode: userInfo.verificationCode,
                    snackbar: {
                        children: <Alert severity="success" variant="filled" sx={{ width: "100%" }}>Successfully changed account name</Alert>
                    },
                }));
            } catch {
                setInGameNameErrors({ inGameName: "Failed to change in game name" });
            }
        }
    };

    const storeInGameName = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInGameNameFormData((formData) => ({
            ...formData,
            [name]: value.trim(),
        }));
    };

    return (
        <Dashboard pageTitle="Settings" currentUrl="/settings">
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                Verification Code
                            </Typography>
                            <Typography component="p" variant="h4">
                                {state.verificationCode} { state.isVerified ?
                                <DoneOutlineIcon /> :
                                <>(unverified) <ButtonBase onClick={() => navigator.clipboard?.writeText(state.verificationCode ?? "")}>
                                    <ContentCopyIcon sx={{height: "22px", width: "auto"}} />
                                </ButtonBase></> }
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                Two Factor Authentication
                            </Typography>
                            <Link to={state.otpAuthCode ?? "#"}><canvas ref={canvasRef}></canvas></Link>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                            <Box component="form" onSubmit={changeInGameName} noValidate>
                                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                    Change Last War Account Name
                                </Typography>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="inGameName"
                                    label="Last War Account Name"
                                    placeholder={state.inGameName ?? undefined}
                                    name="inGameName"
                                    autoComplete="inGameName"
                                    onChange={storeInGameName}
                                    error={Boolean(inGameNameErrors.inGameName)}
                                    helperText={inGameNameErrors.inGameName}
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Change Account Name
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
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
