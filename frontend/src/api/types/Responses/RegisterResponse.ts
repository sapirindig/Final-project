import { RegisteredUser } from "./RegisteredUser";

export interface RegisterResponse {
    message: string;
    registeredUser: RegisteredUser;
};