document.addEventListener("DOMContentLoaded", async () => {
  let lastRow;
  let start = 0;
  let limit = 10;

  let curentFilter = "All";
  let startFilterd = 0;
  let limitFilterd = 10;

  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const searchHint = document.getElementsByClassName("search-hint");
  const loadMoreButton = document.getElementById("load-more");
  const htmlElement = document.documentElement;
  const pageCheck = htmlElement.getAttribute("data-page");

  searchButton.addEventListener("click", () => {
    searchHint[0].innerHTML = `<div class="spinner"></div>`;
    search(searchInput.value);
  });

  if (pageCheck == "transaction") {
    const txid = htmlElement.getAttribute("data-txid");

    loadTransactionByTxid(txid);
    loadTransactions(start, limit, loadMoreButton);
  }

  if (pageCheck != "user") {
    loadMoreButton.addEventListener("click", () => {
      start += 10;
      limit += 10;
      loadMoreButton.innerHTML = `
    <div class="spinner"></div>`;
      loadTransactions(start, limit, loadMoreButton);
    });
  }

  if (pageCheck == "user") {
    const username = htmlElement.getAttribute("data-username");
    const selectElement = document.getElementById("filterTransactions");
    loadMoreButton.addEventListener("click", () => {
      start += 10;
      limit += 10;
      loadMoreButton.innerHTML = `
    <div class="spinner"></div>`;
      loadUserTransaction(start, limit, loadMoreButton);
    });
    selectElement.addEventListener("change", function () {
      startFilterd = 0;
      limitFilterd = 10;
      curentFilter = this.value;
      loadFilteredUserTransaction(
        username,
        curentFilter,
        startFilterd,
        limitFilterd
      );
    });
    loadUserTransaction(username);
    loadUserDetails(username);
    return;
  }
  if (pageCheck == "home") {
    analytics();
    loadTransactions(start, limit, loadMoreButton);
    return;
  }
});

/*

Latest Transactions 
Work With Home Page And Transaction Page

*/

// Load Latest Transactions
loadTransactions = async (start, limit, loadMoreButton) => {
  fetch(`/api/transactions/${start}/${limit}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === 200) {
        renderTransactions(data.data);
        loadMoreButton.innerHTML = "Load More";
      } else {
        notFound();
      }
    })
    .catch((err) => console.error(err));
};

// Load Transaction By Txid
loadTransactionByTxid = async (txid) => {
  fetch(`/api/transactions/${txid}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === 200) {
        renderSingleTransacion(data.data);
      } else {
        notFound();
      }
    })
    .catch((err) => console.error(err));
};
// Render Single Trancations
renderSingleTransacion = (transaction) => {
  const template = `
  <li>Type <span>${transaction.type}</span></li>
  <li>Amount <span class="points">${transaction.amount}</span></li>
  <li>From ${parser(transaction).sender}</li>
  <li>To ${parser(transaction).receiver}</li>
  <li>Transactions ID <span>${transaction.txid}</span></li>
  <li>Age <span>${calculateAge(transaction.timestamp)}</span></li>
  
  `;
  const tableList = document.querySelector(".table-list");
  tableList.innerHTML = template;
};

// Render Latest Trancations
renderTransactions = (transactions) => {
  removeTableTransactionSkeleton();
  const tableBody = document.getElementById("table-transaction");
  transactions.forEach((transaction) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><a href="/transaction/${transaction.txid}">${
      transaction.txid
    }</a></td>
   <td>${parser(transaction).sender}</td>
              <td>${parser(transaction).receiver}</td>
              <td><span class="points">${transaction.amount}</span></td>
              <td class="age" data-timestamp="${
                transaction.timestamp
              }">${calculateAge(transaction.timestamp)}</td>
              <td>${transaction.type}</td>
      `;

    tableBody.appendChild(row);
  });
};

/*

Latest User Transactions & User Details
Work With User Page

*/

// Load User Transactions
loadUserTransaction = (username) => {
  fetch(`/api/users/${username}/transactions/0/10`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === 200) {
        renderUserTransactions(data.data);
      } else {
        notFound();
      }
    })
    .catch((err) => console.error(err));
};

// Render User Trancations To Table
renderUserTransactions = (transactions) => {
  const tableBody = document.getElementById("table-transaction");
  transactions.data.forEach((transaction) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><a href="/transaction/${transaction.txid}">${
      transaction.txid
    }</a></td>
   <td>${parser(transaction).sender}</td>
              <td>${parser(transaction).receiver}</td>
              <td><span class="points">${transaction.amount}</span></td>
              <td class="age" data-timestamp="${
                transaction.timestamp
              }">${calculateAge(transaction.timestamp)}</td>
              <td>${transaction.type}</td>
      `;
    tableBody.appendChild(row);
    removeTableTransactionSkeleton();
  });
};

// Load User Details
loadUserDetails = (username) => {
  fetch(`/api/users/${username}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === 200) {
        renderUserDetails(data.data);
      } else {
        notFound();
      }
    })
    .catch((err) => console.error(err));
};
// Render User Details
renderUserDetails = (userDetails) => {
  const template = `
  <li>Username <span>${userDetails.username}</span></li>
  <li>Balance <span class="points">${userDetails.balance}</span></li>
  <li>Transactions Counts <span>${userDetails.tx_count}</span></li>
  <li>Last Updated <span>${calculateAge(userDetails.last_updated)}</span></li>
  
  `;
  const tableList = document.querySelector(".table-list");
  tableList.innerHTML = template;
};

loadFilteredUserTransaction = (username, filter, start, end) => {
  fetch(`/api/users/${username}/transactions/type/${filter}/${start}/${end}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === 200) {
        console.log(data.data);
      } else {
        notFound();
      }
    })
    .catch((err) => console.error(err));
};
// Remove Skeleton Element
removeTableTransactionSkeleton = () => {
  const tableSkeleton = document.querySelectorAll(".table-skeleton");
  if (tableSkeleton.length === 0) return false;
  const tableBody = (document.getElementById("table-transaction").innerHTML =
    "");
};

/*
Helper Tools
*/

// Update Age Column Every Second
function updateAgeColumn() {
  const ageElements = document.querySelectorAll(".age");

  setInterval(() => {
    ageElements.forEach((ageElement) => {
      const timestamp = parseInt(ageElement.dataset.timestamp, 10); // Milliseconds timestamp
      ageElement.textContent = calculateAge(timestamp);
    });
  }, 1000); // Update every second
}

notFound = () => {
  const template = `
   <div class="center">
          <h1>404 - Not Found</h1>
          <p>
            We Can't Find The Data You Are Looking For, The Reason Is The Data
            Not yet indexed or not found.
          </p>

          <a href="/">Return to Homepage</a>`;
  document.getElementsByTagName("main")[0].innerHTML = template;
};
/// Format Timestamp To Sec,Mins,Hours,Days

function calculateAge(timestamp) {
  const now = Date.now(); // Current time in milliseconds
  const ageInSeconds = Math.floor((now - timestamp) / 1000); // Convert milliseconds to seconds

  if (ageInSeconds < 60) {
    return `${ageInSeconds}s ago`; // Seconds ago
  } else if (ageInSeconds < 3600) {
    return `${Math.floor(ageInSeconds / 60)}m ago`; // Minutes ago
  } else if (ageInSeconds < 86400) {
    return `${Math.floor(ageInSeconds / 3600)}h ago`; // Hours ago
  } else {
    return `${Math.floor(ageInSeconds / 86400)}d ago`; // Days ago
  }
}

function parser(transaction) {
  const sender =
    transaction.sender !== "system"
      ? `<a href="/users/${transaction.sender}">${transaction.sender}</a>`
      : "<span class='uk-text-meta'>system</span>";
  const receiver =
    transaction.receiver !== "system"
      ? `<a href="/users/${transaction.receiver}">${transaction.receiver}</a>`
      : "<span class='uk-text-muted'>system</span>";
  return { sender, receiver };
}

search = (query) => {
  if (query.length >= 24) {
    fetch(`/api/transactions/${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          renderSearchHint(
            "Transaction",
            data.data.txid,
            "/transaction/" + data.data.txid
          );
        } else {
          renderNotFound("Transaction");
        }
      });
  } else {
    fetch(`/api/users/${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          renderSearchHint(
            "Users Account",
            data.data.username,
            "/users/" + data.data.username
          );
        } else {
          renderNotFound("Users Account");
        }
      });
  }
};
renderSearchHint = (type, data, link) => {
  const template = `
  <span>${type}</span>
  <div class="search-hint-wrap">
  <img
    src="https://api.dicebear.com/9.x/notionists-neutral/png?seed=${data}"
    alt=""
    class="avatar"
  />
  <a href="${link}">${data}</a>
</div>
  `;
  const searchHint = document.getElementsByClassName("search-hint");
  searchHint[0].innerHTML = template;
};

renderNotFound = (type) => {
  const template = `<div class="search-hint-wrap">
      <span class="danger">Seems Like You Trying Search For ${type} But With Zero Result :(</span>
    </div>`;
  const searchHint = document.getElementsByClassName("search-hint");
  searchHint[0].innerHTML = template;
};

const analytics = () => {
  const CACHE_DURATION_MS = 3600000; // 1 hour in milliseconds

  /**
   * Fetch statistics from the API and update the UI.
   */
  const fetchAndUpdateStats = async () => {
    try {
      const response = await fetch(`/api/stats`);
      const statsData = await response.json();

      if (statsData.status === 200) {
        updateUIWithStats(statsData);
        cacheStats(statsData);
      } else {
        handleStatsError();
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  /**
   * Render charts and statistics using the provided data.
   * @param {Object} statsData - The stats data from the API.
   */
  const updateUIWithStats = (statsData) => {
    renderChart(statsData.monthlyTransactions);
    renderStats(statsData.totalTransactions, statsData.dailyTransactions);
  };

  /**
   * Cache statistics in localStorage with a timestamp.
   * @param {Object} statsData - The stats data to cache.
   */
  const cacheStats = (statsData) => {
    const cachedData = {
      storedSince: Date.now(),
      data: statsData,
    };
    localStorage.setItem("stats", JSON.stringify(cachedData));
  };

  /**
   * Handle the case when fetching stats fails.
   */
  const handleStatsError = () => {
    renderNotFound("Users Account");
  };

  /**
   * Check if cached statistics are fresh.
   * @returns {Object|null} - Returns parsed stats if fresh, otherwise null.
   */
  const getCachedStats = () => {
    const cachedStats = localStorage.getItem("stats");
    if (!cachedStats) return null;

    const { storedSince, data } = JSON.parse(cachedStats);
    const isFresh = Date.now() - storedSince < CACHE_DURATION_MS;
    return isFresh ? data : null;
  };

  // Main logic
  const cachedStats = getCachedStats();
  if (cachedStats) {
    updateUIWithStats(cachedStats);
  } else {
    fetchAndUpdateStats();
  }
};

renderChart = (transactionData) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0 = January, 1 = February, ..., 11 = December
  const currentYear = currentDate.getFullYear();
  const currentDay = currentDate.getDate();
  const monthAbbr = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const daysInMonthCount = getDaysInMonth(currentMonth, currentYear);
  const daysInMonth = Array.from(
    { length: daysInMonthCount },
    (_, i) => `${monthAbbr[currentMonth]} ${i + 1}`
  );
  const transactionMap = transactionData.reduce((acc, item) => {
    acc[item.date] = item.counts;
    return acc;
  }, {});
  const dailyData = Array.from({ length: daysInMonthCount }, (_, i) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(i + 1).padStart(2, "0")}`;
    return transactionMap[dateKey] || 0; // Default to 0 if no data exists
  });
  const options = {
    series: [
      {
        name: "Transactions",
        data: dailyData,
      },
    ],
    chart: {
      height: 150,
      type: "line",
      toolbar: {
        show: false, // Hide toolbar
      },
      zoom: {
        enabled: false, // Disable zoom
      },
      background: "transparent", // Transparent background
    },
    xaxis: {
      labels: {
        show: false, // Hide x-axis labels
      },
      axisBorder: {
        show: false, // Hide x-axis border
      },
      axisTicks: {
        show: false, // Hide axis ticks
      },
    },
    yaxis: {
      labels: {
        show: false, // Hide y-axis labels
      },
    },
    grid: {
      show: false, // Remove gridlines
    },
    tooltip: {
      enabled: true, // Show tooltips
      theme: "dark", // Use dark theme for tooltips
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const date = daysInMonth[dataPointIndex];
        const value = series[seriesIndex][dataPointIndex];
        return (
          `<div style="background: #1a1a1a; color: white; padding: 10px; border-radius: 5px;">` +
          `<strong>${date}</strong><br>` +
          `Transactions: ${value}` +
          "</div>"
        );
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    colors: ["#FFD700"], // Line color
    markers: {
      size: 0, // Hide markers
    },
  };

  // Render the chart
  const charts = document.querySelector("#chart");
  charts.innerHTML = "";
  const chart = new ApexCharts(charts, options);
  chart.render();
};
renderStats = (total, daily) => {
  document.getElementById("total").innerHTML = `<h3>${total}</h3>`;
  document.getElementById("daily").innerHTML = `<h3>${daily}</h3>`;
};
getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate(); // The 0th day of the next month gives the last day of the current month
};
