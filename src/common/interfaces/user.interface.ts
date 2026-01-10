
import { Types } from "mongoose";
import { UserRole } from "../enums/role.enum";

export interface AuthUser {
    id: Types.ObjectId,
    email: string,
    role: UserRole
}