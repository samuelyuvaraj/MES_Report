import axios from "axios";
import { frontendEnv } from "../config/env";

export const api = axios.create({
    baseURL: frontendEnv.apiBaseUrl,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 15000
});