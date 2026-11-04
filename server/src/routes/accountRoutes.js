
 // DT-751: Routes for Admin Account Management

 // Import Express to create API routes
 const express = require('express');

 // Import middleware to make sure only admins can access accounts
 const { requireAdmin } = require('../middleware/authMiddleware');

 // Import the function that retrieves accounts from Supabase
 const { getAccounts, updateAccount, deleteAccount} = require('../controllers/accountController');

 // Create a router for account management
 const router = express.Router();

 // GET /api/accounts - Retrieve all accounts from the database
 // Only signed-in admins with active accounts can access this route
 router.get('/', requireAdmin, getAccounts);

//only active admin can edit accounts
 router.put('/:id', requireAdmin, updateAccount);
 //Delete, only admins can delete acocuts
 router.delete('/:id', requireAdmin, deleteAccount);


 // Export the router so app.js can use it
 module.exports = router;
