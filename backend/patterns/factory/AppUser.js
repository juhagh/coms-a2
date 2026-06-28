/**
 * Factory pattern — role-based user domain objects.
 *
 * The Mongoose `User` model handles persistence; these classes model the
 * *behaviour* of a user by role. `UserFactory.create(role, data)` returns the
 * matching subclass, so each role's capabilities live in one place instead of
 * being re-derived from `if (role === 'admin')` checks scattered across
 * controllers and middleware. Adding a role means adding a subclass plus a
 * registry entry — no existing call site changes (open for extension, closed
 * for modification).
 *
 * OOP principles demonstrated here:
 *   - Abstraction  : AppUser defines the interface every role honours.
 *   - Inheritance  : StaffUser / KitchenUser / AdminUser extend AppUser.
 *   - Polymorphism : role / permissions() resolve to the concrete role at runtime.
 *   - Encapsulation: each role's permission set lives inside its own class.
 */

class UnknownRoleError extends Error {
    constructor(role) {
        super(`Unknown user role: ${role}`);
        this.name = 'UnknownRoleError';
        this.role = role;
    }
}

/** Abstract base user. */
class AppUser {
    constructor({ id, name, email } = {}) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    /** @returns {string} the role string this class represents */
    get role() {
        throw new Error('AppUser.role must be implemented by a subclass');
    }

    /** @returns {string[]} the permissions granted to this role */
    permissions() {
        return [];
    }

    /** @param {string} permission @returns {boolean} */
    can(permission) {
        return this.permissions().includes(permission);
    }

    // Convenience capability checks (polymorphic via permissions()).
    canCreateOrders() { return this.can('order:create'); }
    canProcessOrders() { return this.can('order:process'); }
    canViewAllOrders() { return this.can('order:read:all'); }
    canManageMenu() { return this.can('menu:write'); }
}

class StaffUser extends AppUser {
    get role() { return 'staff'; }
    permissions() {
        return ['order:create', 'order:read', 'order:cancel', 'menu:read'];
    }
}

class KitchenUser extends AppUser {
    get role() { return 'kitchen'; }
    permissions() {
        return ['order:read:all', 'order:process', 'menu:read'];
    }
}

class AdminUser extends AppUser {
    get role() { return 'admin'; }
    permissions() {
        return ['order:read:all', 'menu:read', 'menu:write', 'reports:read', 'user:manage'];
    }
}

module.exports = {
    AppUser,
    StaffUser,
    KitchenUser,
    AdminUser,
    UnknownRoleError,
};
