// controllers/userController.js
const userModel = require("../models/usersModels");
const {
  getUserTransactionsByOffset,
  filterUsersTransactions,
} = require("../models/transactionModels");

const getUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await userModel.getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ status: 200, data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { username } = req.params;
  const { balance, tx_count, last_updated } = req.body;
  try {
    const updatedUser = await userModel.updateUser(
      username,
      balance,
      tx_count,
      last_updated
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const userTransaction = async (req, res) => {
  const { username, start, end } = req.params;
  try {
    const transactions = await getUserTransactionsByOffset(
      username,
      parseInt(start, 10),
      parseInt(end, 10)
    );
    res.status(200).json({
      status: 200,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const filterUserTransaction = async (req, res) => {
  const { username, type, start, end } = req.params;
  try {
    const transactions = await filterUsersTransactions(
      username,
      type,
      parseInt(start, 10),
      parseInt(end, 10)
    );
    res.status(200).json({
      status: 200,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  getUserByUsername,
  updateUser,
  userTransaction,
  filterUserTransaction,
};
