import { validateString } from "../components/util/helpers";

export const app = {
    API_URL: validateString(process.env.REACT_APP_API_URL),
};
