// models/userModel.js
const supabase = require("../../supbaseClient");
const API = require("../extensions/discordApi");
const { embedParser } = require("../extensions/embedParser");
const { createTransaction } = require("./transactionModels");

const api = new API();

// Get user by username, check if user exists in the database or needs to be fetched from an external API
const getUserByUsername = async (username) => {
  // Fetch user data from the database
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username);

  // Return false if there is an error during the database query
  if (error) return false;

  // If the user does not exist in the database, fetch from the external API
  if (!data.length) {
    return await fetchUserFromApi(username);
  }

  // If user data exists in the database, check if it's outdated (older than 30 minutes)
  if (data[0].last_updated < Date.now() - 1800000) {
    return await updateUserFromApi(username, data[0]);
  }

  // Return the found user data
  return data[0];
};

// Fetch user data from the external API if the user is not in the database
const fetchUserFromApi = async (username) => {
  const userFromApi = await api.findUsers(username);

  // If user is not found in the API, throw an error
  if (userFromApi.length === 0) return false;

  // Add user to the database
  const newUser = await addUser(
    username,
    userFromApi.balance,
    userFromApi.tx_count,
    Date.now()
  );

  // If the user is successfully added to the database, process their transactions
  if (newUser) {
    await addUserTransactions(userFromApi);
  }

  // Return the user data from the API, as it's now added to the database
  return {
    username,
    balance: userFromApi.balance,
    tx_count: userFromApi.tx_count,
    last_updated: Date.now(),
  };
};

// Update user data from the external API if it's outdated
const updateUserFromApi = async (username, existingUser) => {
  const userFromApi = await api.findUsers(username);

  // If user is not found, throw an error
  if (!userFromApi) throw new Error("User not found");

  // Update the user's data in the database
  await updateUser(
    username,
    userFromApi.balance,
    userFromApi.tx_count,
    Date.now()
  );

  // Return the updated user data
  return {
    username,
    balance: userFromApi.balance,
    tx_count: userFromApi.tx_count,
    last_updated: Date.now(),
  };
};

// Add a new user to the database
const addUser = async (username, balance, tx_count, last_updated) => {
  const { data, error } = await supabase
    .from("users")
    .insert({ username, balance, tx_count, last_updated });

  // Return false if there is an error
  if (error) return false;

  return data;
};

// Add user transactions to the database
const addUserTransactions = async (userData) => {
  const { latest_tx } = userData;

  // Process each transaction and create a new transaction entry
  latest_tx.forEach(async (tx) => {
    const transactionData = embedParser.parseTransactionData(tx[0].embeds[0]);
    await createTransaction(
      transactionData.transactionId,
      transactionData.title,
      transactionData.senderUsername,
      transactionData.receiverUsername,
      transactionData.amount,
      Math.floor(new Date(transactionData.timestamp).getTime() / 1000) // Convert timestamp to Unix seconds
    );
  });
};

// Update user data in the database
const updateUser = async (username, balance, tx_count, last_updated) => {
  const { data, error } = await supabase
    .from("users")
    .update({ balance, tx_count, last_updated })
    .eq("username", username);

  // If there's an error during the update, throw an error
  if (error) {
    return false;
  }

  return true;
};

module.exports = {
  getUserByUsername,
  updateUser,
  addUser,
};
