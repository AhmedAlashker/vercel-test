import { roles } from './../../middleware/auth.js';

export const endPoint = {
    addCar: [roles.Admin, roles.User],
    updateCar: [roles.Admin, roles.User],
    getCar: [roles.Admin, roles.User],
}