const { expect } = require('chai');
const { UserFactory } = require('../patterns/factory/UserFactory');
const {
    StaffUser,
    KitchenUser,
    AdminUser,
    UnknownRoleError,
} = require('../patterns/factory/AppUser');

describe('User Factory (Factory pattern)', () => {

    describe('create()', () => {
        it('builds a StaffUser for role "staff" and carries the data', () => {
            const u = UserFactory.create('staff', { name: 'Sarah', email: 's@cafe.com' });
            expect(u).to.be.instanceOf(StaffUser);
            expect(u.role).to.equal('staff');
            expect(u.name).to.equal('Sarah');
            expect(u.email).to.equal('s@cafe.com');
        });

        it('builds a KitchenUser for role "kitchen"', () => {
            expect(UserFactory.create('kitchen')).to.be.instanceOf(KitchenUser);
        });

        it('builds an AdminUser for role "admin"', () => {
            expect(UserFactory.create('admin')).to.be.instanceOf(AdminUser);
        });

        it('throws UnknownRoleError for an unregistered role', () => {
            expect(() => UserFactory.create('wizard'))
                .to.throw(UnknownRoleError, 'Unknown user role: wizard');
        });

        it('reports the roles it supports', () => {
            expect(UserFactory.supportedRoles())
                .to.have.members(['staff', 'kitchen', 'admin']);
        });
    });

    describe('role permissions (polymorphism + encapsulation)', () => {
        it('staff can create orders but not manage the menu or see all orders', () => {
            const staff = UserFactory.create('staff');
            expect(staff.canCreateOrders()).to.equal(true);
            expect(staff.canManageMenu()).to.equal(false);
            expect(staff.canViewAllOrders()).to.equal(false);
        });

        it('kitchen can process and view all orders but not create them', () => {
            const kitchen = UserFactory.create('kitchen');
            expect(kitchen.canProcessOrders()).to.equal(true);
            expect(kitchen.canViewAllOrders()).to.equal(true);
            expect(kitchen.canCreateOrders()).to.equal(false);
        });

        it('admin can manage the menu and view all orders', () => {
            const admin = UserFactory.create('admin');
            expect(admin.canManageMenu()).to.equal(true);
            expect(admin.canViewAllOrders()).to.equal(true);
        });

        it('can() reflects each role-specific permission set', () => {
            expect(UserFactory.create('admin').can('user:manage')).to.equal(true);
            expect(UserFactory.create('staff').can('user:manage')).to.equal(false);
        });
    });
});
