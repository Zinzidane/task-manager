import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('User entity', () => {
    let user: User;

    beforeEach(() => {
        user = new User();
        user.password = 'TestPassword';
        user.salt = 'TestSalt';
        bcrypt.hash = jest.fn();
    });

    describe('validatePassword', () => {
        it('returns true as password is valid', async () => {
            bcrypt.hash.mockReturnValue('TestPassword');
            expect(bcrypt.hash).not.toHaveBeenCalled();
            const result = await user.validatePassword('123456');
            expect(bcrypt.hash).toHaveBeenCalledWith('123456', 'TestSalt');
            expect(result).toEqual(true);
        });

        it('returns false as password is invalid', async () => {
            bcrypt.hash.mockReturnValue('TestPasasadssword');
            expect(bcrypt.hash).not.toHaveBeenCalled();
            const result = await user.validatePassword('123456');
            expect(bcrypt.hash).toHaveBeenCalledWith('123456', 'TestSalt');
            expect(result).toEqual(false);
        });
    });
});
