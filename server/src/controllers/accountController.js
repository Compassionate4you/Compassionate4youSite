
 // DT-751: Connect Admin Account Management to Supabase

 // Import Prisma to communicate with the database
 const prisma = require('../config/db');

 // GET /api/accounts - Retrieve all user accounts from Supabase
 async function getAccounts(req, res, next) {
     try {
         // Get all accounts from the User table
         const accounts = await prisma.user.findMany({
             // Only retrieve the information needed by the Admin Dashboard
             select: {
                 id: true,
                 name: true,
                 email: true,
                 phone: true,
                 role: true,
                 accountStatus: true,
                 createdAt: true,
             },

             // Show the newest accounts first
             orderBy: { createdAt: 'desc' },
         });

         // Send the accounts to the frontend
         return res.status(200).json({
             success: true,
             accounts,
         });

     } catch (err) {
         // Send any database errors to the error handler
         return next(err);
     }
 }





 // DT-751: Update an existing user account in Supabase
 // PUT /api/accounts/:id
 async function updateAccount(req, res, next) {
     try {
         // Get the account ID from the URL
         const { id } = req.params;

         // Get the updated information from the Admin Dashboard
         const { name, email, phone, role, accountStatus } = req.body || {};

         // Check that all required fields are valid
         if (
             typeof name !== 'string' || !name.trim() ||
             typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
             !['admin', 'customer'].includes(role) ||
             !['active', 'inactive'].includes(accountStatus) ||
             (phone !== undefined && phone !== null && typeof phone !== 'string')
         ) {
             return res.status(400).json({
                 success: false,
                 error: { message: 'Invalid account information.' },
             });
         }

         // Check that the account exists in the database
         const existingAccount = await prisma.user.findUnique({
             where: { id },
             select: { id: true },
         });

         if (!existingAccount) {
             return res.status(404).json({
                 success: false,
                 error: { message: 'Account not found.' },
             });
         }

         // Prevent admins from removing their own admin access
         if (id === req.user.id && (role !== 'admin' || accountStatus !== 'active')) {
             return res.status(400).json({
                 success: false,
                 error: { message: 'You cannot deactivate or demote your own admin account.' },
             });
         }

         // Save the updated account information to Supabase
         const account = await prisma.user.update({
             where: { id },
             data: {
                 name: name.trim(),
                 email: email.trim().toLowerCase(),
                 ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
                 role,
                 accountStatus,
             },

             // Return only account information, never passwords
             select: {
                 id: true,
                 name: true,
                 email: true,
                 phone: true,
                 role: true,
                 accountStatus: true,
                 createdAt: true,
             },
         });

         // Return the updated account to the frontend
         return res.status(200).json({
             success: true,
             account,
         });

     } catch (err) {
         // Pass database errors to the existing error handler
         return next(err);
     }
 }




 // DT-751: Delete an existing user account from Supabase
// DELETE /api/accounts/:id
async function deleteAccount(req, res, next) {
    try {
        // Get the account ID from the URL
        const { id } = req.params;

        // Prevent admins from deleting their own accounts
        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                error: { message: 'You cannot delete your own admin account.' },
            });
        }

        // Check whether the account exists
        const existingAccount = await prisma.user.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existingAccount) {
            return res.status(404).json({
                success: false,
                error: { message: 'Account not found.' },
            });
        }

        // Permanently delete the account from Supabase
        await prisma.user.delete({
            where: { id },
        });

        // Tell the frontend the account was deleted successfully
        return res.status(200).json({
            success: true,
            message: 'Account deleted successfully.',
        });

    } catch (err) {
        // Pass database errors to the existing error handler
        return next(err);
    }
}


 // Export the function so accountRoutes.js can use it
 module.exports = {
     getAccounts,
     updateAccount,
     deleteAccount,
 };
