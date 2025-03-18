# MatsFi Transaction Explorer

MatsFi Transaction Explorer is a RESTful API designed for retrieving transaction and user data from the Mezo Discord platform. This API allows users to explore transaction details, search for specific transactions, and filter user transactions by type.

## Features
- Retrieve transactions by offset.
- Get transaction details using transaction ID.
- Search for user details by username.
- Fetch user transactions by username with pagination.
- Filter user transactions by type.

## API Documentation

### Transactions

#### Get Transactions by Offset
**Endpoint:**
```
GET /api/transactions/:start/:end
```
**Description:** Retrieves a list of transactions within the specified offset range.

**Example Request:**
```
GET /api/transactions/0/10
```

**Example Response:**
```json
{
    "status": 200,
    "data": [
        {
            "txid": "67d95fb950aae08e0f99a89a",
            "type": "Quest Claimed",
            "sender": "system",
            "receiver": "amit0909111",
            "amount": 350,
            "timestamp": 1742299065477,
            "created_at": "2025-03-18T11:57:46.070555+00:00"
        },
        {
            "txid": "67d95f5950aae08e0f99a898",
            "type": "Quest Claimed",
            "sender": "system",
            "receiver": "amit0909111",
            "amount": 250,
            "timestamp": 1742298969069,
            "created_at": "2025-03-18T11:56:09.559545+00:00"
        }
    ]
}
```

#### Get Transaction by Transaction ID
**Endpoint:**
```
GET /api/transactions/:txid
```
**Description:** Retrieves the details of a specific transaction using its transaction ID.

**Example Request:**
```
GET /api/transactions/67d95fb950aae08e0f99a89a
```

**Example Response:**
```json
{
    "status": 200,
    "data": {
        "txid": "67d95fb950aae08e0f99a89a",
        "type": "Quest Claimed",
        "sender": "system",
        "receiver": "amit0909111",
        "amount": 350,
        "timestamp": 1742299065477,
        "created_at": "2025-03-18T11:57:46.070555+00:00"
    }
}
```

### Users

#### Get User by Username
**Endpoint:**
```
GET /api/users/:username
```
**Description:** Retrieves user details by username.

**Example Request:**
```
GET /api/users/amit0909111
```

**Example Response:**
```json
{
    "status": 200,
    "data": {
        "username": "amit0909111",
        "balance": "950",
        "tx_count": 2,
        "last_updated": 1742299869805
    }
}
```

#### Get User Transactions
**Endpoint:**
```
GET /api/users/:username/transactions/:start/:end
```
**Description:** Retrieves transactions made by a specific user within a given range.

**Example Request:**
```
GET /api/users/amit0909111/transactions/0/10
```

**Example Response:**
```json
{
    "status": 200,
    "data": {
        "data": [
            {
                "txid": "67d95fb950aae08e0f99a89a",
                "type": "Quest Claimed",
                "sender": "system",
                "receiver": "amit0909111",
                "amount": 350,
                "timestamp": 1742299065477,
                "created_at": "2025-03-18T11:57:46.070555+00:00"
            },
            {
                "txid": "67d95f5950aae08e0f99a898",
                "type": "Quest Claimed",
                "sender": "system",
                "receiver": "amit0909111",
                "amount": 250,
                "timestamp": 1742298969069,
                "created_at": "2025-03-18T11:56:09.559545+00:00"
            }
        ]
    }
}
```

## Installation & Usage
1. Clone this repository.
2. Install dependencies using `npm install`.
3. Start the API server with `npm start`.
4. Use the provided endpoints to interact with the transaction explorer.

## License
This project is open-source and available under the MIT License.

