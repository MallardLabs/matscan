const axios = require("axios");
const { discordToken, guildId, channelId } = require("../../config");
class API {
  constructor() {
    this.GUILD_ID = guildId;
    this.CHANNEL_ID = channelId;
    this.USER_TOKEN = discordToken;
    this.BASE_URL = `https://discord.com/api/v9/guilds/${this.GUILD_ID}`;

    this.headers = {
      accept: "*/*",
      "accept-language": "en-US",
      authorization: `${this.USER_TOKEN}`,
      "sec-ch-ua":
        '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
    };
  }

  /**
   * Convert a human-readable date string to a Discord snowflake timestamp.
   * @param {string} dateStr - The date in 'YYYY-MM-DD HH:MM:SS' format.
   * @returns {number} - The Discord snowflake.
   */
  convertToSnowflake(dateStr) {
    const discordEpoch = 1420070400000;
    const dateTime = new Date(dateStr);
    const timestamp = dateTime.getTime(); // Convert to milliseconds
    const discordTimestamp = timestamp - discordEpoch;
    return discordTimestamp << 22; // Shift left to fit the snowflake format
  }

  /**
   * Convert a Discord snowflake to a human-readable datetime.
   * @param {number} snowflake - The Discord snowflake.
   * @returns {Date} - The corresponding datetime in UTC.
   */
  snowflakeToDate(snowflake) {
    const discordEpoch = 1420070400000;
    const timestamp = (snowflake >> 22) + discordEpoch; // Shift the snowflake to get the timestamp
    return new Date(timestamp);
  }

  /**
   * Get the total number of transactions from Discord API.
   */
  async getTotalTx() {
    try {
      const params = { author_id: "1268283703998550047" };
      const response = await axios.get(`${this.BASE_URL}/messages/search`, {
        params,
        headers: this.headers,
      });
      return response.data.total_results || 0;
    } catch (error) {
      console.error("Error fetching total transactions:", error.message);
      return 0;
    }
  }

  /**
   * Get the number of transactions from the previous day.
   */
  async getDailyTx(min, max) {
    try {
      const currentDate = new Date();
      const pastDate = new Date();
      pastDate.setDate(currentDate.getDate() - 1);

      const params = {
        author_id: "1268283703998550047",
        min_id: min,
        max_id: max,
      };

      const response = await axios.get(`${this.BASE_URL}/messages/search`, {
        params,
        headers: this.headers,
      });
      return response.data.total_results || 0;
    } catch (error) {
      console.error("Error fetching daily transactions:", error.message);
      return 0;
    }
  }

  /**
   * Get the latest transactions from a specific channel.
   */
  async getLatestTx() {
    try {
      const params = {
        channel_id: this.CHANNEL_ID,
        author_id: "1268283703998550047",
      };

      const response = await axios.get(`${this.BASE_URL}/messages/search`, {
        params,
        headers: this.headers,
      });

      return response.data.messages || [];
    } catch (error) {
      console.error("Error fetching latest transactions:", error.message);
      return [];
    }
  }

  /**
   * Find a specific transaction by ID.
   * @param {string} txid - The transaction ID to find.
   */
  async findTx(txid) {
    try {
      const params = { channel_id: "1262870830975811677", content: txid };

      const response = await axios.get(`${this.BASE_URL}/messages/search`, {
        params,
        headers: this.headers,
      });

      return response.data.messages || [];
    } catch (error) {
      console.error("Error finding transaction:", error.message);
      return [];
    }
  }

  /**
   * Find user transactions by username.
   * @param {string} username - The username to search for.
   */
  async findUsers(username) {
    try {
      const params = { channel_id: "1262870830975811677", content: username };

      const response = await axios.get(`${this.BASE_URL}/messages/search`, {
        params,
        headers: this.headers,
      });

      if (response.data.total_results === 0) {
        return [];
      } else {
        return {
          tx_count: response.data.total_results,
          balance: await this.getUsersBalance(username),
          latest_tx: response.data.messages,
        };
      }
    } catch (error) {
      console.error("Error finding user transactions:", error.message);
      return [];
    }
  }

  /**
   * Get the latest transaction containing the user's balance.
   * @param {string} username - The username to search for.
   */
  async getUsersBalance(username) {
    try {
      const params = {
        channel_id: "1262870830975811677",
        content: `Receiver ${username}`,
      };

      const response = await axios.get(`${this.BASE_URL}/messages/search`, {
        params,
        headers: this.headers,
      });

      return (
        response.data.messages[0][0].embeds[0].description.match(
          /\*\*Receiver Balance\*\*: (\d+)/
        )[1] || null
      );
    } catch (error) {
      console.error("Error getting user balance:", error.message);
      return null;
    }
  }
}

module.exports = API;
