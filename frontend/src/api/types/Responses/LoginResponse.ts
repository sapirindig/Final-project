import { RegisteredUser } from "./RegisteredUser";

export interface LoginResponse {
    RegisteredUser: RegisteredUser;
    token: string;
};