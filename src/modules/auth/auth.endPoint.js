
import { roles } from './../../middleware/auth.js';

export const endPoint = {
    createCategory: [roles.Admin, roles.User],
    updateCategory: [roles.Admin, roles.User],
    getCategory: [roles.Admin, roles.User],
}