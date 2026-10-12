// Add Account handlers
import { useState } from "react";

function useAccounts() {
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [editingAccountId, setEditingAccountId] = useState(null);
    const [accountPendingDelete, setAccountPendingDelete] = useState(null);
    const [accounts, setAccounts] = useState([
        {
            id: 1,
            name: "John Doe",
            birthdate: "1988-04-12",
            email: "john.doe@example.com",
            role: "Customer",
            created: "Jan 15, 26",
            status: "Active",
            lastLogin: "Mar 08, 26",
        },
        {
            id: 2,
            name: "Mary Smith",
            birthdate: "1975-10-03",
            email: "mary.smith@example.com",
            role: "Customer",
            created: "Feb 10, 26",
            status: "Active",
            lastLogin: "Mar 07, 26",
        },
        {
            id: 3,
            name: "Robert Williams",
            birthdate: "1969-11-21",
            email: "robert.will@example.com",
            role: "Customer",
            created: "May 22, 25",
            status: "Inactive",
            lastLogin: "Oct 28, 25",
        },
        {
            id: 4,
            name: "James Cameron",
            birthdate: "1980-08-18",
            email: "james.cam@admin.com",
            role: "Admin",
            created: "Sep 01, 25",
            status: "Active",
            lastLogin: "April 08, 26",
        },
        {
            id: 5,
            name: "Michael Brown",
            birthdate: "1975-09-16",
            email: "michael.brown@admin.com",
            role: "Admin",
            created: "Jan 26, 26",
            status: "Active",
            lastLogin: "April 01, 26",
        },
    ]);

    const [accountForm, setAccountForm] = useState({
        name: "", birthdate: "", email: "", role: "", status: "",
    });

    // Clears all Account form fields upon Cancel
    const resetAccountForm = () => {
        setAccountForm({
            name: "", birthdate: "", email: "", role: "", status: "",
        });
    };

    // Opens an empty form for a new Account.
    const handleOpenAddAccount = () => {
        resetAccountForm();
        setEditingAccountId(null);
        setShowAccountForm(true);
    };

    // Discards form changes and returns to the table.
    const handleCancelAccount = () => {
        resetAccountForm();
        setEditingAccountId(null);
        setShowAccountForm(false);
    };

    // Updates the matching Account form field.
    const handleAccountInputChange = (event) => {
        const { name, value } = event.target;
        setAccountForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    };

    // Formats YYYY-MM-DD for display in the Account table.
    const formatAccountBirthdate = (birthdate) => {
        return new Date(
            `${birthdate}T00:00:00`
        ).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "2-digit",
        });
    };

    // Adds a new Account or saves changes to an existing Account.
    const handleAddAccount = (event) => {
        event.preventDefault();
        const accountName = accountForm.name.trim();
        const accountEmail =
            accountForm.email.trim().toLowerCase();
        if (
            !accountName ||
            !accountForm.birthdate ||
            !accountEmail ||
            !accountForm.role ||
            !accountForm.status
        ) {
            return;
        }
        if (editingAccountId !== null) {
            setAccounts((currentAccounts) =>
                currentAccounts.map((account) =>
                    account.id === editingAccountId
                        ? {
                              ...account,
                              name: accountName,
                              birthdate: accountForm.birthdate,
                              email: accountEmail,
                              role: accountForm.role,
                              status: accountForm.status,
                          }
                        : account
                )
            );
        } else {
            const createdDate = new Date().toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "2-digit",
                    year: "2-digit",
                }
            );
            const newAccount = {
                id: Date.now(),
                name: accountName,
                birthdate: accountForm.birthdate,
                email: accountEmail,
                role: accountForm.role,
                created: createdDate,
                status: accountForm.status,
                lastLogin: "Recently",
            };
            setAccounts((currentAccounts) => [
                ...currentAccounts,
                newAccount,
            ]);
        }
        resetAccountForm();
        setEditingAccountId(null);
        setShowAccountForm(false);
    };

    // Opens the form with an existing Account's information
    const handleEditAccount = (account) => {
        setAccountForm({
            name: account.name,
            birthdate: account.birthdate,
            email: account.email,
            role: account.role,
            status: account.status,
        });
        setEditingAccountId(account.id);
        setShowAccountForm(true);
    };

    // Opens the Account deletion confirmation.
    const handleDeleteAccount = (account) => {setAccountPendingDelete(account); };

    // Closes the deletion confirmation without deleting.
    const handleCancelDeleteAccount = () => {setAccountPendingDelete(null); };

    // Deletes the selected Account.
    const handleConfirmDeleteAccount = () => {
        if (!accountPendingDelete) {
            return;
        }

        setAccounts((currentAccounts) =>
            currentAccounts.filter(
                (account) =>
                    account.id !== accountPendingDelete.id
            )
        );

        setAccountPendingDelete(null);
    };

    return {
        showAccountForm,
        editingAccountId,
        accountPendingDelete,
        accounts,
        accountForm,
        handleOpenAddAccount,
        handleCancelAccount,
        handleAccountInputChange,
        formatAccountBirthdate,
        handleAddAccount,
        handleEditAccount,
        handleDeleteAccount,
        handleCancelDeleteAccount,
        handleConfirmDeleteAccount,
    };
}

export default useAccounts;