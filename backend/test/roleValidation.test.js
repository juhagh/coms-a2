const { expect } = require('chai');
const { validateRoleChange } = require('../controllers/authController');

describe('validateRoleChange (admin role management)', () => {

    it('allows a valid role change to a different user', () => {
        expect(validateRoleChange('kitchen', 'userA', 'adminB')).to.equal(null);
    });

    it('accepts each allowed role', () => {
        ['staff', 'kitchen', 'admin'].forEach((r) => {
            expect(validateRoleChange(r, 'targetUser', 'adminB')).to.equal(null);
        });
    });

    it('rejects an unknown role', () => {
        expect(validateRoleChange('wizard', 'userA', 'adminB')).to.match(/Role must be one of/);
    });

    it('rejects an empty/missing role', () => {
        expect(validateRoleChange(undefined, 'userA', 'adminB')).to.match(/Role must be one of/);
    });

    it('rejects changing your own role (self-lockout guard)', () => {
        expect(validateRoleChange('staff', 'sameId', 'sameId')).to.match(/your own role/);
    });

    it('checks role validity before the self-change guard', () => {
        // an invalid role on yourself reports the role problem first
        expect(validateRoleChange('wizard', 'sameId', 'sameId')).to.match(/Role must be one of/);
    });
});
