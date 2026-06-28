const {
    StaffUser,
    KitchenUser,
    AdminUser,
    UnknownRoleError,
} = require('./AppUser');

/**
 * Registry: role string -> concrete user class.
 * Adding a role means registering one class here; no call site changes.
 */
const ROLE_REGISTRY = {
    staff: StaffUser,
    kitchen: KitchenUser,
    admin: AdminUser,
};

class UserFactory {
    /**
     * Build the domain user object for a given role.
     * @param {string} role
     * @param {{ id?: string, name?: string, email?: string }} [data]
     * @returns {import('./AppUser').AppUser}
     * @throws {UnknownRoleError} when the role is not registered
     */
    static create(role, data = {}) {
        const UserClass = ROLE_REGISTRY[role];
        if (!UserClass) {
            throw new UnknownRoleError(role);
        }
        return new UserClass(data);
    }

    /** @returns {string[]} the roles this factory can build */
    static supportedRoles() {
        return Object.keys(ROLE_REGISTRY);
    }
}

module.exports = { UserFactory };
