// controllers/transactionController.js
const transactionModel = require("../models/transactionModels");

// Create a new transaction
const createTransaction = async (req, res) => {
  const { txid, type, sender, receiver, amount, timestamp } = req.body;
  try {
    const transaction = await transactionModel.createTransaction(
      txid,
      type,
      sender,
      receiver,
      amount,
      timestamp
    );
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a transaction by txid
const getTransactionByTxid = async (req, res) => {
  const { txid } = req.params;
  try {
    const transaction = await transactionModel.getTransactionByTxid(txid);
    if (!transaction) {
      return res
        .status(404)
        .json({ status: 404, message: "Transaction not found" });
    }
    res.status(200).json({ status: 200, data: transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transactions by offset
const getTransactionsByOffset = async (req, res) => {
  const { start, end } = req.params;
  try {
    if (!start || !end) {
      return res.status(400).json({
        status: 400,
        message: "Start and end parameters are required",
      });
    }
    if (parseInt(start, 10) > parseInt(end, 10)) {
      return res.status(400).json({
        status: 400,
        message: "Start parameter must be less than or equal to end parameter",
      });
    }
    if (
      isNaN(parseInt(start, 10)) ||
      isNaN(parseInt(end, 10)) ||
      parseInt(end, 10) - parseInt(start, 10) > 100
    ) {
      return res.status(400).json({
        status: 400,
        message: "Maximum offset is 100",
      });
    }
    const transactions = await transactionModel.getTransactionsByOffset(
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

const stats = async (req, res) => {
  try {
    const curent = await transactionModel.countTransactionsForToday();

    const total = await transactionModel.countTransactions();
    console.log(total);
    res.status(200).json({
      status: 200,
      totalTransactions: total,
      dailyTransactions: curent,
      monthlyTransactions: await transactionModel.getMonthlyTransactions(),
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Something Went Wrong!",
    });
  }
};
module.exports = {
  createTransaction,
  getTransactionByTxid,
  getTransactionsByOffset,
  stats,
};
