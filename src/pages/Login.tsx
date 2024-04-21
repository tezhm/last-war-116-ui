import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ChangeEvent, FormEvent, JSX, useState } from "react";
import { Navigate } from "react-router-dom";
import { AccessTokenCache } from "../components/authentication/AccessTokenCache";
import { ApiClient } from "../components/clients/ApiClient";
import { titles } from "../components/titles/Titles";

interface LoginState {
    snackbar: {
        children?: JSX.Element;
        message?: string;
        autoHideDuration?: number;
    }|null;
}

export function Login(): JSX.Element {
    const [state, setState] = useState<LoginState>({ snackbar: null });
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        rememberMe: false,
    });
    const [errors, setErrors] = useState({
        username: "",
        password: "",
    });

    const accessToken = AccessTokenCache.getInstance().loadAccessToken();

    if (accessToken) {
        AccessTokenCache.getInstance().update(accessToken);
        return <Navigate to={titles.secretaryOfStrategy.url} />
    }

    const validateForm = () => {
        let valid = true;
        const newErrors = { username: "", password: "" };

        if (!formData.username) {
            newErrors.username = "Username is required";
            valid = false;
        }

        if (!formData.password || formData.password.length < 8 || formData.password.length > 20) {
            newErrors.password = "Password must be between 8 and 20 characters in length";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (validateForm()) {
            try {
                const accessToken = await ApiClient.getInstance().login(formData.username, formData.password);
                AccessTokenCache.getInstance().update(accessToken);
                window.location.href = titles.secretaryOfStrategy.url;
            } catch (error) {
                setState((state) => ({ ...state, snackbar: {
                    children: <Alert severity="error" variant="filled" sx={{ width: "100%" }}>Login failed</Alert>,
                }}));
            }
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        setFormData({
            ...formData,
            [name]: name === "rememberMe" ? checked : value.trim(),
        });
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Typography component="h1" variant="h5">
                    #116 Title Reservations
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
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
                    <FormControlLabel
                        control={<Checkbox checked={formData.rememberMe} onChange={handleChange} name="rememberMe" color="primary" />}
                        label="Remember me"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <Link href="#" variant="body2" onClick={
                                () => setState({ ...state, snackbar: {
                                    children: <Alert severity="error" variant="filled" sx={{ width: "100%" }}>Not implemented yet sorry</Alert>,
                                }})
                            }>
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href="/signup" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
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
