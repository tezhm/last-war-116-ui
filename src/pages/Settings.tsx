import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Fade from "@mui/material/Fade";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { ChangeEvent, FormEvent, JSX, useEffect, useState } from "react";
import { ApiClient } from "../components/clients/ApiClient";
import { Dashboard } from "../components/layout/Dashboard";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import IconButton from "@mui/material/IconButton";
import ButtonBase from "@mui/material/ButtonBase";
import Alert from "@mui/material/Alert";


interface SettingsState {
    inGameName: string|null;
    verificationCode: string|null;
    isVerified: boolean;
    loading: boolean;
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
        loading: false,
        snackbar: null,
    });
    const [passwordFormData, setPasswordFormData] = useState({
        currentPassword: "",
        newPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState({
        currentPassword: "",
        newPassword: "",
    });
    const [inGameNameFormData, setInGameNameFormData] = useState({
        inGameName: "",
    });
    const [inGameNameErrors, setInGameNameErrors] = useState({
        inGameName: "",
    });

    useEffect(() => {
        ApiClient.getInstance().queryUserInfo().then((userInfo) => {
            setState((state) => ({
                ...state,
                inGameName: userInfo.inGameName,
                verificationCode: userInfo.verificationCode,
            }));
        });
    }, []);

    const indicatorSize = 80;

    const validatePassword = () => {
        let valid = true;
        const newErrors = { currentPassword: "", newPassword: "" };

        if (!passwordFormData.currentPassword || passwordFormData.currentPassword.length < 8 || passwordFormData.currentPassword.length > 20) {
            newErrors.currentPassword = "Password must be between 8 and 20 characters in length";
            valid = false;
        }

        if (!passwordFormData.newPassword || passwordFormData.newPassword.length < 8 || passwordFormData.newPassword.length > 20) {
            newErrors.newPassword = "Password must be between 8 and 20 characters in length";
            valid = false;
        }

        setPasswordErrors(newErrors);
        return valid;
    };

    const changePassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (validatePassword()) {
            try {
                await ApiClient.getInstance().changePassword(passwordFormData.currentPassword, passwordFormData.newPassword);
                setState((state) => ({
                    ...state,
                    snackbar: {
                        children: <Alert severity="success" variant="filled" sx={{ width: "100%" }}>Successfully changed password</Alert>
                    },
                }));
            } catch {
                setPasswordErrors({ currentPassword: "Failed to change password", newPassword: "Failed to change password" });
            }
        }
    };

    const storePassword = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordFormData((formData) => ({
            ...formData,
            [name]: value.trim(),
        }));
    };

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
                            <Box component="form" onSubmit={changePassword} noValidate>
                                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                    Change password
                                </Typography>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="currentPassword"
                                    label="Current password"
                                    type="password"
                                    id="current-password"
                                    autoComplete="current-password"
                                    onChange={storePassword}
                                    error={Boolean(passwordErrors.currentPassword)}
                                    helperText={passwordErrors.currentPassword}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="newPassword"
                                    label="New password"
                                    type="password"
                                    id="new-password"
                                    autoComplete="new-password"
                                    onChange={storePassword}
                                    error={Boolean(passwordErrors.newPassword)}
                                    helperText={passwordErrors.newPassword}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Change password
                                </Button>
                            </Box>
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
