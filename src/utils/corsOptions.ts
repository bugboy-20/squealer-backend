import { allowedOrigins } from "./allowedOrigins";
import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200
}
