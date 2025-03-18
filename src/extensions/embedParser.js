function parseTransaction(transactionString) {
  const description = transactionString.description.replace(
    "N/A",
    "<@123> (123 - system)"
  );
  const regex =
    /\*\*Amount\*\*: (\d+)[\s\S]*?\*\*Sender\*\*: <@(\d+)> \(\d+ - ([\w.\-]+)\)[\s\S]*?\*\*Receiver\*\*: <@(\d+)> \(\d+ - ([\w.\-]+)\)[\s\S]*?\*\*Transaction ID\*\*: ([\da-f]+)$/i;

  const match = description.match(regex);

  if (match) {
    const amount = match[1];
    const senderId = match[2];
    const sender = match[3];
    const receiverId = match[4];
    const receiver = match[5];
    const txid = match[6];
    if (sender == "system") {
      return {
        title: transactionString.title.replace("Transaction: ", ""),
        timestamp: transactionString.timestamp,
        amount,
        sender,
        receiver,
        receiverBalance: description.match(
          /\*\*Receiver Balance\*\*: (\d+)[\s\S]*?/
        )[1],
        txid,
      };
    }
    return {
      title: transactionString.title.replace("Transaction: ", ""),
      timestamp: transactionString.timestamp,
      amount,
      sender,
      receiver,
      txid,
    };
  } else {
    console.log("No match found");
  }
}

module.exports = { parseTransaction };
