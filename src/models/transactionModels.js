// models/transactionModel.js

const supabase = require("../../supbaseClient");
const api = require("../extensions/discordApi");
const discodApi = new api();
const { parseTransaction } = require("../extensions/embedParser");
const moment = require("moment");

/**
 * Create a new transaction in the database.
 * @param {string} txid - Transaction ID.
 * @param {string} type - Type of transaction.
 * @param {string} sender - Sender's identifier.
 * @param {string} receiver - Receiver's identifier.
 * @param {number} amount - Transaction amount.
 * @param {number} timestamp - Timestamp in milliseconds.
 * @returns {object|boolean} - Created transaction or false on error.
 */
const createTransaction = async (
  txid,
  type,
  sender,
  receiver,
  amount,
  timestamp
) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert([{ txid, type, sender, receiver, amount, timestamp }]);

  if (error) {
    console.error("Error creating transaction:", error);
    return false;
  }
  return data;
};

/**
 * Fetch all transactions from the database.
 * @returns {array} - List of all transactions.
 */
const getTransactions = async () => {
  const { data, error } = await supabase.from("transactions").select("*");

  if (error) {
    throw new Error("Error fetching transactions: " + error.message);
  }
  return data;
};

/**
 * Fetch a specific transaction by txid.
 * @param {string} txid - Transaction ID.
 * @returns {object|boolean} - The transaction or false if not found.
 */
const getTransactionByTxid = async (txid) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("txid", txid)
    .single();

  if (error || !data) {
    console.warn(
      "Transaction not found in database, attempting to fetch from API..."
    );
    return false; // Optionally fallback to fetchTransactionFromApi(txid);
  }
  return data;
};

/**
 * Fetch a transaction from the Discord API.
 * @param {string} txid - Transaction ID.
 * @returns {object|boolean} - Parsed transaction or false if not found.
 */
const fetchTransactionFromApi = async (txid) => {
  const apiResult = await discodApi.findTx(txid);

  if (!apiResult.length) {
    return false;
  }

  const tx = parseTransaction(apiResult[0][0].embeds[0]);
  await createTransaction(
    tx.txid,
    tx.title,
    tx.sender,
    tx.receiver,
    tx.amount,
    new Date(tx.timestamp).getTime()
  );

  return {
    txid: tx.txid,
    type: tx.title,
    sender: tx.sender,
    receiver: tx.receiver,
    amount: tx.amount,
    timestamp: new Date(tx.timestamp).getTime(),
  };
};

/**
 * Fetch transactions by offset for pagination.
 * @param {number} start - Start index.
 * @param {number} end - End index.
 * @returns {array} - List of transactions within the range.
 */
const getTransactionsByOffset = async (start, end) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("timestamp", { ascending: false })
    .range(start, end);

  if (error) {
    throw new Error("Error fetching transactions by offset: " + error.message);
  }
  return data;
};

const getTransactionsByCategory = async (category, start, end) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("timestamp", { ascending: false })
    .eq("type", category)
    .range(start, end);

  if (error || !data) {
    console.warn(
      "Transaction not found in database, attempting to fetch from API..."
    );
    return false; // Optionally fallback to fetchTransactionFromApi(txid);
  }
  return data;
};

/**
 * Fetch total transactions grouped by day for the current month.
 * @returns {array} - List of transaction counts per day.
 */
const getMonthlyTransactions = async () => {
  const { data, error } = await supabase.rpc("monthlytransaction");

  if (error) {
    throw new Error(
      "Error executing monthly transaction query: " + error.message
    );
  }
  return data;
};

/**
 * Count transactions for the current day.
 * @returns {number} - Count of today's transactions.
 */
const countTransactionsForToday = async () => {
  const now = new Date();
  const startOfDay = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const endOfDay = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  );

  const { count, error } = await supabase
    .from("transactions")
    .select("timestamp", { count: "exact" })
    .gte("timestamp", startOfDay)
    .lt("timestamp", endOfDay);

  if (error) {
    throw new Error("Error counting today's transactions: " + error.message);
  }

  return count;
};

/**
 * Count all transactions in the database.
 * @returns {number} - Total transaction count.
 */
const countTransactions = async () => {
  const { count, error } = await supabase
    .from("transactions")
    .select("*", { count: "exact" });

  if (error) {
    throw new Error("Error counting transactions: " + error.message);
  }
  return count;
};

/**
 * Fetch transactions by offset with a search string.
 * @param {string} searchString - Search term for sender/receiver.
 * @param {number} from - Start index for pagination.
 * @param {number} to - End index for pagination.
 * @returns {object} - Paginated transaction results.
 */
const getUserTransactionsByOffset = async (searchString, from, to) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("timestamp", { ascending: false })
    .or(`sender.ilike.%${searchString}%,receiver.ilike.%${searchString}%`)
    .range(from, to);

  if (error) {
    throw new Error(
      "Error fetching user transactions by offset: " + error.message
    );
  }

  return { data };
};
const filterUsersTransactions = async (username, category, start, end) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("timestamp", { ascending: false })
    .eq("type", category)
    .or(`sender.ilike.%${username}%,receiver.ilike.%${username}%`)
    .range(start, end);

  if (error || !data) {
    console.warn(
      "Transaction not found in database, attempting to fetch from API..."
    );
    return false; // Optionally fallback to fetchTransactionFromApi(txid);
  }
  return data;
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionByTxid,
  getTransactionsByOffset,
  filterUsersTransactions,
  countTransactionsForToday,
  countTransactions,
  getUserTransactionsByOffset,
  getMonthlyTransactions,
  getTransactionsByCategory,
};
