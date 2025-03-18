const express = require("express");
const transaction = require("../controler/transactionController");
const users = require("../controler/usersController");
const router = express.Router();

// System Routes router.get("/system/stats", systemController.getSystemStats);

router.get("/transactions/:start/:end", transaction.getTransactionsByOffset);
router.get("/transactions/:txid", transaction.getTransactionByTxid);

router.get("/users/:username", users.getUserByUsername);
router.get("/users/:username/transactions/:start/:end", users.userTransaction);
router.get(
  "/users/:username/transactions/type/:type/:start/:end",
  users.filterUserTransaction
);

router.get("/stats", transaction.stats);
module.exports = router;
