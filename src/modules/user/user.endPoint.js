
import { roles } from './../../middleware/auth.js';

export const endPoint = {
    updatePassword: [roles.Admin, roles.User],
    profile: [roles.Admin, roles.User],
    getCategory: [roles.Admin, roles.User],
}