// Accounts Tab functionality
function AccountsTab({
    showAccountForm,
    editingAccountId,
    accountForm,
    accounts,
    onOpenAddAccount,
    onAccountInputChange,
    onSubmitAccount,
    onCancelAccount,
    onEditAccount,
    onDeleteAccount,
    formatAccountBirthdate,
}) {
    return (
        <div className="admin-table-card">
            <div className="account-section-header">
                <div>
                    <h2>Account Management</h2>
                    <p>Manage user accounts</p>
                </div>

                {!showAccountForm && (
                    <button
                        type="button"
                        className="admin-add-button"
                        onClick={onOpenAddAccount}
                    >
                        Add Account
                    </button>
                )}
            </div>

            {showAccountForm ? (
                <form
                    className="account-form"
                    onSubmit={onSubmitAccount}
                >
                    <h2>
                        {editingAccountId === null
                            ? "Add Account"
                            : "Edit Account"}
                    </h2>

                    <p className="account-form-description">
                        Complete every field to add an account.
                    </p>

                    <div className="account-form-grid">
                        <div className="account-form-field">
                            <label htmlFor="account-name">
                                Full Name
                            </label>

                            <input
                                id="account-name"
                                type="text"
                                name="name"
                                value={accountForm.name}
                                onChange={onAccountInputChange}
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        <div className="account-form-field">
                            <label htmlFor="account-birthdate">
                                Birthdate
                            </label>

                            <input
                                id="account-birthdate"
                                type="date"
                                name="birthdate"
                                value={accountForm.birthdate}
                                onChange={onAccountInputChange}
                                required
                            />
                        </div>

                        <div className="account-form-field account-email-field">
                            <label htmlFor="account-email">
                                Email
                            </label>

                            <input
                                id="account-email"
                                type="email"
                                name="email"
                                value={accountForm.email}
                                onChange={onAccountInputChange}
                                placeholder="Enter email address"
                                required
                            />
                        </div>

                        <div className="account-form-field">
                            <label htmlFor="account-role">
                                Role
                            </label>

                            <select
                                id="account-role"
                                name="role"
                                value={accountForm.role}
                                onChange={onAccountInputChange}
                                required
                            >
                                <option value="" disabled>
                                    Select a role
                                </option>

                                <option value="Customer">
                                    Customer
                                </option>

                                <option value="Admin">
                                    Admin
                                </option>
                            </select>
                        </div>

                        <div className="account-form-field">
                            <label htmlFor="account-status">
                                Status
                            </label>

                            <select
                                id="account-status"
                                name="status"
                                value={accountForm.status}
                                onChange={onAccountInputChange}
                                required
                            >
                                <option value="" disabled>
                                    Select a status
                                </option>

                                <option value="Active">
                                    Active
                                </option>

                                <option value="Inactive">
                                    Inactive
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="account-form-actions">
                        <button
                            type="button"
                            className="account-cancel-button"
                            onClick={onCancelAccount}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="account-submit-button"
                        >
                            {editingAccountId === null
                                ? "Add Account"
                                : "Save Changes"}
                        </button>
                    </div>
                </form>
            ) : (
                <table className="admin-table admin-accounts-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Birthdate</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created</th>
                            <th>Status</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {accounts.map((account) => (
                            <tr key={account.id}>
                                <td>{account.name}</td>

                                <td>
                                    {formatAccountBirthdate(account.birthdate)}
                                </td>

                                <td>{account.email}</td>
                                <td>{account.role}</td>
                                <td>{account.created}</td>

                                <td>
                                    <span
                                        className={`admin-status admin-status-${account.status.toLowerCase()}`}
                                    >
                                        {account.status}
                                    </span>
                                </td>

                                <td>{account.lastLogin}</td>

                                <td>
                                    <div className="account-row-actions">
                                        <button
                                            type="button"
                                            className="admin-table-action"
                                            onClick={() =>
                                                onEditAccount(account)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="admin-table-action admin-table-delete"
                                            onClick={() =>
                                                onDeleteAccount(account)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AccountsTab;