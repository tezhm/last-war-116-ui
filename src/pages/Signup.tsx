import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import qrcode from "qrcode";
import { ChangeEvent, FormEvent, JSX, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AccessTokenCache } from "../components/authentication/AccessTokenCache";
import { ApiClient } from "../components/clients/ApiClient";
import { titles } from "../components/titles/Titles";
import { TwoFactorAuth } from "../components/util/TwoFactorAuth";

interface SignupState {
    snackbar: {
        children?: JSX.Element;
        message?: string;
        autoHideDuration?: number;
    }|null;
}

interface OtpAuthState {
    username: string|null;
    otpAuthCode: string|null;
}

export function Signup(): JSX.Element {
    const [state, setState] = useState<SignupState>({ snackbar: null });
    const [formData, setFormData] = useState({
        username: "",
        inGameName: "",
        verificationCode: "",
    });
    const [errors, setErrors] = useState({
        username: "",
        inGameName: "",
        verificationCode: "",
    });
    const [otpAuth, setOtpAuth] = useState<OtpAuthState>({
        username: null,
        otpAuthCode: null,
    });
    const canvasRef = useRef(null);

    useEffect(() => {
        // Capture username to protect against races when waiting for QR code to generate
        const username = formData.username;

        // Don't generate a new QR code if already generated and username field has not changed
        if (otpAuth.otpAuthCode !== null && username === otpAuth.username) {
            if (canvasRef.current) {
                qrcode.toCanvas(canvasRef.current, otpAuth.otpAuthCode);
            }
        } else {
            // Generate a new QR code for adding to authenticator app
            TwoFactorAuth.getInstance().generateOtpAuth(username).then((otpAuthCode) => {
                setOtpAuth({ username, otpAuthCode: otpAuthCode });
            });
        }
    }, [formData.username, otpAuth.otpAuthCode, otpAuth.username]);

    useEffect(() => {
        const accessToken = AccessTokenCache.getInstance().loadAccessToken();

        if (accessToken) {
            window.location.replace(titles.secretaryOfStrategy.url);
        }
    }, []);

    const validateUserName = (username: string) => {
        let valid = true;
        let error = "";

        if (!username || username.length < 4 || username.length > 20) {
            error = "Username must be between 4 and 20 characters in length";
            valid = false;
        }

        if (username?.match(/\p{L}/gu)?.join('') !== username) {
            error = "Username must contain only valid unicode letters";
            valid = false;
        }

        setErrors((state) => ({ ...state, username: error }));
        return valid;
    };

    const handleChangeUsername = (e: ChangeEvent<HTMLInputElement>) => {
        const username = e.target.value.trim();
        setFormData((state) => ({...state, username }));
    };

    const validateInGameName = (inGameName: string) => {
        let valid = true;
        let error = "";

        if (!inGameName || inGameName.length < 2 || inGameName.length > 20) {
            error = "In-game name must be between 2 and 20 characters in length";
            valid = false;
        }

        setErrors((state) => ({ ...state, inGameName: error }));
        return valid;
    };

    const handleChangeInGameName = (e: ChangeEvent<HTMLInputElement>) => {
        const inGameName = e.target.value.trim();
        setFormData((state) => ({...state, inGameName }));
    };

    const verifyAuthenticationCode = (token: string, otpAuthCode: string|null) => {
        let valid = true;
        let error = "";

        if (!otpAuthCode || !TwoFactorAuth.getInstance().verifyTotp(token, otpAuthCode)) {
            error = "Invalid verification code";
            valid = false;
        }

        setErrors((state) => ({ ...state, verificationCode: error }));
        return valid;
    };

    const handleChangeVerificationCode = (e: ChangeEvent<HTMLInputElement>) => {
        const verificationCode = e.target.value.trim();
        setFormData((state) => ({...state, verificationCode }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Running validation on everything so bulk updates ui
        const validUsername = validateUserName(formData.username);
        const validInGameName = validateInGameName(formData.inGameName);
        const validAuthenticationCode = verifyAuthenticationCode(formData.verificationCode, otpAuth.otpAuthCode);

        if (validUsername && validInGameName && validAuthenticationCode && otpAuth.otpAuthCode) {
            try {
                const result = await ApiClient.getInstance().subscribe(
                    formData.username,
                    otpAuth.otpAuthCode,
                    formData.inGameName
                );
                AccessTokenCache.getInstance().update(result.accessToken);
                window.location.replace(titles.secretaryOfStrategy.url);
            } catch (error) {
                if (error instanceof Error && error.message.includes("Username already in use")) {
                    setErrors((state) => ({ ...state, username: "Already taken" }));
                } else if (error instanceof Error && error.message.includes("Account name already in use")) {
                    setErrors((state) => ({ ...state, inGameName: "Already taken" }));
                }

                setState((state) => ({ ...state, snackbar: {
                    children: <Alert severity="error" variant="filled" sx={{ width: "100%" }}>{String(error ?? "Unknown error occurred")}</Alert>,
                }}));
            }
        }
    };

    return (
        <Container component="main" maxWidth="lg">
            <Box sx={{ display: "flex", marginTop: 8 }}>
                <Grid container spacing={3} alignItems="center" justifyContent="center">
                    <CssBaseline />
                    <Grid item xs={12} sm={8} md={5}>
                        <List component="form" onSubmit={handleSubmit} noValidate>
                            <ListItem dense={true}>
                                <Typography component="h2" variant="h5" color="primary" gutterBottom>
                                    Welcome #116!
                                </Typography>
                            </ListItem>
                            <ListItem dense={true}>
                                <Typography component="i" variant="body1">
                                    Please choose any username for logging into this website
                                </Typography>
                            </ListItem>
                            <ListItem dense={true}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Username"
                                    onChange={handleChangeUsername}
                                    error={Boolean(errors.username)}
                                    helperText={errors.username}
                                    autoFocus
                                />
                            </ListItem>
                            <ListItem dense={true}>
                                <Typography component="i" variant="body1">
                                    Enter your Last War in-game name so we can verify who you are (you can change this at anytime)
                                </Typography>
                            </ListItem>
                            <ListItem dense={true}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Last War In-Game Name"
                                    onChange={handleChangeInGameName}
                                    error={Boolean(errors.inGameName)}
                                    helperText={errors.inGameName}
                                />
                            </ListItem>
                            <ListItem dense={true}>
                                <Typography component="i" variant="body1">
                                    Add the following QR code to your authenticator app. This is how you login (we don't use any passwords)
                                </Typography>
                            </ListItem>
                            <ListItem dense={true}>
                                <Link to={otpAuth.otpAuthCode ?? "#"}><canvas ref={canvasRef}></canvas></Link>
                            </ListItem>
                            <ListItem dense={true}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    type="number"
                                    label="Verify Authentication Code"
                                    onChange={handleChangeVerificationCode}
                                    error={Boolean(errors.verificationCode)}
                                    helperText={errors.verificationCode}
                                />
                            </ListItem>
                            <ListItem dense={true}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                >
                                    Sign Up
                                </Button>
                            </ListItem>
                        </List>
                    </Grid>
                </Grid>
            </Box>
            <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                      open={!!state.snackbar}
                      onClose={() => setState({ ...state, snackbar: null })}
                      message={state.snackbar?.message}
                      autoHideDuration={state.snackbar?.autoHideDuration}>
                {state.snackbar?.children}
            </Snackbar>
        </Container>
    );
}
