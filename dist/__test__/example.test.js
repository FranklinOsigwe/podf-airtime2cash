"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("../app"));
const supertest_1 = __importDefault(require("supertest"));
const database_config_1 = __importDefault(require("../config/database.config"));
const request = (0, supertest_1.default)(app_1.default);
// jest.setTimeout(100000);
beforeAll(async () => {
    await database_config_1.default.sync({ force: true }).then(() => {
        // eslint-disable-next-line no-console
        console.log('database connected is tested');
    });
});
describe('our user apis are tested', () => {
    it('should check if verification email is sent', async () => {
        const response = await request.post('/users/forgotpassword').send({
            email: 'john@gmail.com',
        });
        expect(response.status).toBe(200);
    });
    it('should reset user password', async () => {
        const response = await request.post('/users/login').send({
            username: 'johnd',
            password: '12345678',
        });
        const { id } = response.body.User;
        const response2 = await request.patch(`/users/reset-password/${id}`).send({
            password: '123456789',
            confirmpassword: '123456789',
        });
        expect(response2.status).toBe(200);
    });
});
