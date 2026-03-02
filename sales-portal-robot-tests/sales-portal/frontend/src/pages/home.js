function renderHomePageLayout(metrics) {
  return `
<div id="contentInner">
  <div class="shadow-sm p-3 mb-5 bg-body rounded">
    <div class="container my-5">
      <!-- Section Header -->
      <div class="page-header text-center">
          <h1 class="display-4 welcome-text">Welcome to Sales Management Portal</h1>
          <p class="lead subheader-text">
              Monitor key metrics, manage orders, and optimize customer interactions — all in one place.
          </p>
      </div>

      <!-- Action Buttons Section -->
      <div class="row text-center mt-5">
        <div class="col-md-4 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <i class="bi bi-list-check display-4 mb-3"></i>
              <h5 class="card-title">Orders</h5>
              <p class="card-text">Manage and process orders from customers and managers.</p>
              <a href="#/orders" class="btn btn-primary" id="orders-from-home">View Orders</a>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <i class="bi bi-box-seam display-4 mb-3"></i>
              <h5 class="card-title">Products</h5>
              <p class="card-text">Manage and update product listings, including editing and deleting.</p>
              <a href="#/products" class="btn btn-primary" id="products-from-home">View Products</a>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <i class="bi bi-people display-4 mb-3"></i>
              <h5 class="card-title">Customers</h5>
              <p class="card-text">View and manage customer information and interactions.</p>
              <a href="#/customers" class="btn btn-primary" id="customers-from-home">View Customers</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Title for Metrics -->
      <div class="row mb-4 mt-5">
        <div class="col page-header">
          <h2 class="text-center">Business Metrics Overview</h2>
          <p class="text-muted text-center">Here you can track the key metrics and performance indicators of your store</p>
        </div>
      </div>

      <!-- Metrics Cards Section -->
      <div class="row text-center mb-5 d-flex justify-content-between">
        <div class="col-md-2 mb-4">
          <div class="card shadow-sm h-100 position-relative" id="total-orders-container">
            <div class="card-body">
              <i class="bi bi-cart4 display-4 mb-3"></i>
              <h5 class="card-title">Orders This Year</h5>
              <p class="card-text display-6 text-primary">${metrics.orders.totalOrders}</p>
            </div>
          </div>
        </div>

        <div class="col-md-2 mb-4">
          <div class="card shadow-sm h-100 position-relative" id="total-revenue-container">
            <div class="card-body">
              <i class="bi bi-currency-dollar display-4 mb-3"></i>
              <h5 class="card-title">Total Revenue</h5>
              <p class="card-text display-6 text-primary">$${numeral(metrics.orders.totalRevenue).format("0.0a")}</p>
            </div>
          </div>
        </div>

        <div class="col-md-2 mb-4">
          <div class="card shadow-sm h-100 position-relative" id="total-customers-container">
            <div class="card-body">
              <i class="bi bi-person-plus-fill display-4 mb-3"></i>
              <h5 class="card-title">New Customers</h5>
              <p class="card-text display-6 text-primary">${metrics.customers.totalNewCustomers}</p>
            </div>
          </div>
        </div>

        <div class="col-md-2 mb-4">
          <div class="card shadow-sm h-100 position-relative" id="avg-orders-value-container">
            <div class="card-body">
              <i class="bi bi-receipt display-4 mb-3"></i>
              <h5 class="card-title">Avg Order Value</h5>
              <p class="card-text display-6 text-primary">
                $${numeral(metrics.orders.averageOrderValue).format("0.0a")}
              </p>
            </div>
          </div>
        </div>

        <div class="col-md-2 mb-4">
          <div class="card shadow-sm h-100 position-relative" id="canceled-orders-container">
            <div class="card-body">
              <i class="bi bi-x-circle-fill display-4 mb-3"></i>
              <h5 class="card-title">Canceled Orders</h5>
              <p class="card-text display-6 text-primary">${metrics.orders.totalCanceledOrders}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Chart Block -->
      <div class="row mb-5 align-items-center">
        <div class="col-md-6 position-relative" id="orders-chart-container">
          <canvas id="ordersChart" width="400" height="200"></canvas>
        </div>
        <div class="col-md-6">
          <h4>Orders in ${new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}</h4>
          <p>This chart shows the number of orders created during the current month. You can track daily orders and sales trends.</p>
        </div>
      </div>

      <!-- Products Chart Block -->
      <div class="row mb-5 align-items-center">
        <div class="col-md-6 order-md-2 position-relative" id="top-products-chart-container">
          <canvas id="topProductsChart" width="400" height="200"></canvas>
        </div>
        <div class="col-md-6 order-md-1">
          <h4>Top Sold Products</h4>
          <p>This chart displays the top 5 best-selling products. You can monitor product performance and identify top sellers.</p>
        </div>
      </div>

      <!-- Customer Growth Chart Block -->
      <div class="row mb-5 align-items-center">
        <div class="col-md-6 position-relative" id="customer-growth-chart-container">
          <canvas id="customerGrowthChart" width="400" height="200"></canvas>
        </div>
        <div class="col-md-6">
          <h4>Customer Growth</h4>
          <p>This chart shows customer registration growth over the last 15 days. You can track the dynamics of customer acquisition.</p>
        </div>
      </div>

      <!-- Recent Orders and Top Customers Section -->
      <div class="row mt-5">
        <!-- Recent Orders Table -->
        <div class="col-md-6 position-relative">
          ${recentOrdersTable(metrics.orders.recentOrders)}
        </div>

        <!-- Top Customers Table -->
        <div class="col-md-6 position-relative">
            ${topCustomersTable(metrics.customers.topCustomers)}
        </div>
      </div>
    </div>
  </div>
</div>

`;
}

function createRecentOrderRow(order) {
  return `
    <tr>
        <td>${order.customer.name}</td>
        <td>${order.status}</td>
        <td>${order.total_price}</td>
        <td><a href=${ROUTES.ORDER_DETAILS(
          order._id
        )} class="btn btn-link" title="Order Details"><i class="bi bi-card-text"></i></a></td>
    </tr>
    `;
}

function recentOrdersTable(recentOrders) {
  return `
            <h4>Recent Orders</h4>
            <div id="recent-orders-container" class="table-responsive">
              <table class="table table-striped">
                <thead>
                <tr>
                    <th scope="col">Customer</th>
                    <th scope="col">Status</th>
                    <th scope="col">Total</th>
                    <th scope="col">Details</th>
                </tr>
                </thead>
                <tbody>
                <!-- Replace with dynamic data -->
                ${recentOrders.map((o) => createRecentOrderRow(o)).join("")}
                </tbody>
              </table>
            </div>
    `;
}

function createTopCustomersRow(customer) {
  return `
              <tr>
                <td scope="col">${customer.customerName}</td>
                <td scope="col">$${customer.totalSpent}</td>
                <td><a href="${ROUTES.CUSTOMER_DETAILS(
                  customer._id
                )}" class="btn btn-link" title="Customer Details"><i class="bi bi-card-text"></i></a></td>
              </tr>
    `;
}

function topCustomersTable(customers) {
  return `
            <h4>Top Customers</h4>
            <div id="top-customers-container" class="table-responsive">
              <table class="table table-striped">
                  <thead>
                  <tr>
                      <th scope="col">Customer Name</th>
                      <th scope="col">Total Spent</th>
                      <th scope="col">Details</th>
                  </tr>
                  </thead>
                  <tbody>
                  <!-- Replace with dynamic data -->
                  ${customers.map((c) => createTopCustomersRow(c)).join("")}
                  </tbody>
              </table>
            </div>
    `;
}

const homeProps = {
  path: "Home",
  title: "Home Page",
  content: "Home Content",
  ordersTitle: "Module with all orders, created by our managers and customers, edit and process them",
  customersTitle: "Module with all customers registered, that can be also edited and deleted",
  productsTitle: "Module with all products presented in out store, that can be also edited and deleted",
};

function loadCharts(orderDataFromApi, topProductsData, customerDataFromApi) {
  const ordersCtx = document.getElementById("ordersChart").getContext("2d");
  const productsCtx = document.getElementById("topProductsChart").getContext("2d");
  const customerGrowthCtx = document.getElementById("customerGrowthChart").getContext("2d");

  const ordersData = {
    labels: orderDataFromApi.map((order) => `${order.date.year}-${order.date.month}-${order.date.day}`),
    datasets: [
      {
        label: "Orders Created Per Day",
        data: orderDataFromApi.map((order) => order.count),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const productLabels = topProductsData.map((product) => product.name);
  const productSales = topProductsData.map((product) => product.sales);

  const productsData = {
    labels: productLabels,
    datasets: [
      {
        label: "Top Sold Products",
        data: productSales,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const days = customerDataFromApi.map((data) => `${data.date.year}-${data.date.month}-${data.date.day}`);
  const customerData = customerDataFromApi.map((data) => data.count);

  const customerGrowthData = {
    labels: days,
    datasets: [
      {
        label: "New Customers",
        data: customerData,
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  new Chart(ordersCtx, {
    type: "line",
    data: ordersData,
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            callback: function (value) {
              if (Number.isInteger(value)) {
                return value;
              }
            },
          },
        },
      },
    },
  });

  new Chart(productsCtx, {
    type: "bar",
    data: productsData,
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            callback: function (value) {
              if (Number.isInteger(value)) {
                return value;
              }
            },
          },
        },
      },
    },
  });

  new Chart(customerGrowthCtx, {
    type: "line",
    data: customerGrowthData,
    options: {
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  });
}
