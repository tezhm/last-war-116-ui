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
import { ChangeEvent, FormEvent, JSX, useState } from "react";
import { Navigate } from "react-router-dom";
import { AccessTokenCache } from "../components/authentication/AccessTokenCache";
import { ApiClient } from "../components/clients/ApiClient";
import { titles } from "../components/titles/Titles";

interface SignupState {
    snackbar: {
        children?: JSX.Element;
        message?: string;
        autoHideDuration?: number;
    }|null;
}

export function Signup(): JSX.Element {
    const [state, setState] = useState<SignupState>({ snackbar: null });
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        inGameName: "",
    });
    const [errors, setErrors] = useState({
        username: "",
        password: "",
        inGameName: "",
    });

    const accessToken = AccessTokenCache.getInstance().loadAccessToken();

    if (accessToken) {
        AccessTokenCache.getInstance().update(accessToken);
        return <Navigate to={titles.secretaryOfStrategy.url} />
    }

    const validateForm = () => {
        let valid = true;
        const newErrors = { username: "", password: "", inGameName: "" };

        if (!formData.username || formData.username.length < 4 || formData.username.length > 20) {
            newErrors.username = "Username must be between 4 and 20 characters in length";
            valid = false;
        }

        if (!formData.password || formData.password.length < 8 || formData.password.length > 20) {
            newErrors.password = "Password must be between 8 and 20 characters in length";
            valid = false;
        }

        if (!formData.inGameName || formData.inGameName.length < 2 || formData.inGameName.length > 20) {
            newErrors.inGameName = "Account name must be between 2 and 20 characters in length";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (validateForm()) {
            try {
                const result = await ApiClient.getInstance().subscribe(
                    formData.username,
                    formData.password,
                    formData.inGameName
                );
                AccessTokenCache.getInstance().update(result.accessToken);
                window.location.href = titles.secretaryOfStrategy.url;
            } catch (error) {
                if (error instanceof Error && error.message.includes("Username already in use")) {
                    setErrors({ username: "Already taken", password: "", inGameName: "" });
                } else if (error instanceof Error && error.message.includes("Account name already in use")) {
                    setErrors({ username: "", password: "", inGameName: "Already taken" });
                }

                setState((state) => ({ ...state, snackbar: {
                    children: <Alert severity="error" variant="filled" sx={{ width: "100%" }}>{String(error)}</Alert>,
                }}));
            }
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value.trim(),
        });
    };

    return (
        <Container component="main" maxWidth="lg">
            <Box sx={{ display: "flex", marginTop: 8 }}>
                <Grid container spacing={3} alignItems="center" justifyContent="center">
                    <CssBaseline />
                    <Grid item xs={12} sm={8} md={5}>
                        <List>
                            <ListItem>
                                <Typography component="h2" variant="h5" color="primary" gutterBottom>
                                    Welcome #116!
                                </Typography>
                            </ListItem>
                            <ListItem>
                                <Typography component="p" variant="body1">
                                    Please choose any username (this is only for logging into this website)
                                </Typography>
                            </ListItem>
                            <ListItem>
                                <Typography component="p" variant="body1">
                                    <b>DO NOT USE AN EXISTING PASSWORD!!!</b> Be safe online and always create a new password
                                </Typography>
                            </ListItem>
                            <ListItem>
                                <Typography component="p" variant="body1">
                                    Your account name must match your name in the game so we can verify who you are
                                </Typography>
                            </ListItem>
                            <ListItem>
                                <Typography component="p" variant="body1">
                                    Enjoy!
                                </Typography>
                            </ListItem>
                        </List>
                    </Grid>
                    <Grid item xs={12} sm={8} md={5}>
                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                onChange={handleChange}
                                error={Boolean(errors.username)}
                                helperText={errors.username}
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                onChange={handleChange}
                                error={Boolean(errors.password)}
                                helperText={errors.password}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="inGameName"
                                label="Last War Account Name"
                                name="inGameName"
                                autoComplete="inGameName"
                                onChange={handleChange}
                                error={Boolean(errors.inGameName)}
                                helperText={errors.inGameName}
                                autoFocus
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Sign Up
                            </Button>
                        </Box>
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
