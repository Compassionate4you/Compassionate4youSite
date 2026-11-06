//useEffect runs when the dashboard loads
import { useState, useEffect } from "react";
//Import the API function to retrieve accounts from supabase
import { apiGetAccounts, apiUpdateAccount, apiDeleteAccount } from "../../services/api";

function useAccounts() {
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [editingAccountId, setEditingAccountId] = useState(null);
    const [accountPendingDelete, setAccountPendingDelete] = useState(null);
    const [accounts, setAccounts] = useState([]);


    //Retrieve accounts when the dashboard loads
    useEffect(() => {
        async function loadAccounts() {
            try {
                //request accounts from the backend
                const data = await apiGetAccounts();

                //Convert database fields to the format used by the dashboard

                 const databaseAccounts = data.accounts.map((account) => ({
                id: account.id,
                name: account.name || "",
                email: account.email,
                phone: account.phone || "",
                role: account.role === "admin" ? "Admin" : "Customer",
                status: account.accountStatus === "active" ? "Active" : "Inactive",
                created: new Date(account.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "2-digit",
                }),

                // These fields are not currently stored in the User table
                birthdate: "",
                lastLogin: "",
            }));

            // Display the database accounts instead of hardcoded accounts
            setAccounts(databaseAccounts);
        } catch (err) {
            // Display errors in the browser console
            console.error("Failed to load accounts:", err);
        }
    }

    loadAccounts();
}, []);



    const [accountForm, setAccountForm] = useState({
        name: "", birthdate: "", email: "", role: "", status: "",
    });

    // Clears all Account form fields upon Cancel
    const resetAccountForm = () => {
        setAccountForm({
            name: "", birthdate: "", email: "", role: "", status: "",
        });
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

    // Saves changes to an existing account.
    const handleUpdateAccount = async (event) => {
        event.preventDefault();

        if (editingAccountId === null) {
            return;
        }

        const accountName = accountForm.name.trim();
        const accountEmail = accountForm.email.trim().toLowerCase();

        if (
            !accountName ||
            !accountEmail ||
            !accountForm.role ||
            !accountForm.status
        ) {
            return;
        }

        try {
            const updateData = {
                name: accountName,
                email: accountEmail,
                role: accountForm.role.toLowerCase(),
                accountStatus: accountForm.status.toLowerCase(),
            };

            await apiUpdateAccount(editingAccountId, updateData);

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

            resetAccountForm();
            setEditingAccountId(null);
            setShowAccountForm(false);
        } catch (err) {
            console.error("Failed to update account:", err);
        }
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
    const handleConfirmDeleteAccount = async () => {
        if (!accountPendingDelete) {
            return;
        }
        try {
            //Delete the account from supabase first
            await apiDeleteAccount(accountPendingDelete.id);
        
          

        setAccounts((currentAccounts) =>
            currentAccounts.filter(
                (account) =>
                    account.id !== accountPendingDelete.id
            )
        );
          setAccountPendingDelete(null);

    }

    catch (err) {
        //keep the account on screen if database deletion fails
        console.error("Failed to delete account:", err);
    }
};

    return {
        showAccountForm,
        editingAccountId,
        accountPendingDelete,
        accounts,
        accountForm,
        handleUpdateAccount,
        handleCancelAccount,
        handleAccountInputChange,
        formatAccountBirthdate,
        handleEditAccount,
        handleDeleteAccount,
        handleCancelDeleteAccount,
        handleConfirmDeleteAccount,
    };
}

export default useAccounts;