# E-commerce Operations Dashboard

A responsive, client-side operations dashboard built with React, JSX, and Vite. It brings order activity, sales performance, inventory levels, and operational alerts into one interface. The application currently uses linked mock data and an asynchronous mock service layer; it does not connect to a production API or database.

## Live application

- [https://fieldnote-rho-hazel.vercel.app/overview](https://fieldnote-rho-hazel.vercel.app/overview)

## Project overview

The dashboard is intended to give an e-commerce operations team a single place to review store activity and spot work that needs attention. It presents order and revenue KPIs, trends, searchable and filterable order records, product stock levels, and delayed-order or stock alerts.

### Business problem

When order, sales, and inventory information is spread across separate tools, staff must spend time assembling reports and may overlook delayed orders or low stock. This project demonstrates how that information can be organized for faster operational review. The dashboard is a frontend prototype, not a live operational system.

### Primary stakeholder

The primary stakeholder is an e-commerce operations manager or team responsible for order fulfillment, inventory follow-up, and daily store performance.

### Decisions the dashboard is designed to support

- Which recent orders need review, and what is their current status?
- How is delivered-order revenue changing over time?
- Which products are at or below their reorder level, or out of stock?
- Which delivery alerts should be followed up or marked resolved?
- How do order counts and performance metrics change over a selected date range?

### Success metrics

The interface reports operational measures including delivered revenue, total/pending/delivered order counts, revenue comparisons, average order value, delivery and cancellation rates, product stock counts, and alert counts. These are dashboard metrics calculated from the included mock dataset, not measured business outcomes.

For a future production evaluation, useful outcome measures could include time to identify delayed orders, alert resolution time, stockout frequency, and time required to prepare an operations review. No such outcomes have been measured by this prototype.

## Features

- Overview with calculated KPIs, revenue and order charts, recent orders, and an alerts preview.
- Orders management with customer/order search, status and date filters, sortable columns, pagination, and order details.
- Analytics with monthly revenue comparison, sales trend, status distribution, top-selling products, performance summary, and date-range filters.
- Inventory and alerts with searchable and filterable stock, low-stock and out-of-stock views, delayed-order alerts, and a confirmation flow for resolving alerts.
- Responsive sidebar navigation and keyboard-accessible interactions, focus indicators, labelled controls, loading/error/empty states, and horizontally scrollable tables on narrow screens.
- Persistent light/dark theme switch, with a warm paper-and-pine visual system and contrasting accent colors.
- Bangladeshi Taka formatting for monetary values.

## Technology stack

- React 19 and JSX
- Vite 8
- React Router 7
- Recharts 3
- Lucide React
- CSS
- Oxlint

Dependency and script definitions are in [`package.json`](./package.json). The application uses JavaScript; TypeScript declaration packages in development dependencies are supplied by the React/Vite ecosystem and do not mean the app is written in TypeScript.

## Project architecture

```text
src/
  components/   Shared shell, navigation, KPI, charts, tables, dialogs, alert views
  data/         Linked sample customers, products, orders, and operational alerts
  pages/        Route-level Overview, Orders, Analytics, and Inventory pages
  services/     Asynchronous mock API and domain-specific service functions
  utils/        KPI/analytics calculations, chart preparation, validation, formatting
  App.jsx       Route definitions and default/fallback redirects
  main.jsx      React entry point and router setup
  index.css     Global styles and shared status styles
```

`DashboardLayout` provides the shared header, responsive sidebar, and route outlet. Each page requests data through services rather than importing datasets directly. Services return `{ data, meta }` response objects. Calculation and presentation helpers live outside route components where practical.

Overview and Analytics chart modules are loaded with React lazy loading so chart code is split into separate build chunks.

### Data and calculations

- `src/data/customers.js`, `products.js`, and `orders.js` hold linked entities and order/product relationships.
- `src/data/operationalAlerts.js` contains operational alert records.
- `src/data/salesAnalytics.js` is a derived sample analytics fixture; the current analytics service calculates reports from orders and products instead.
- `src/utils/dashboardKpis.js` calculates Overview KPI values.
- `src/utils/analyticsCalculations.js` builds filtered analytics summaries and chart series.
- `src/utils/overviewCharts.js` prepares Overview chart data.
- `src/utils/formatters.js` contains currency and display formatters.

## Getting started

### Requirements

Install Node.js and npm. This project was validated with Node.js 22.20.0 and npm 10.9.3.

### Install and run

From the project directory:

```bash
npm install
npm run dev
```

Vite prints the local development URL after startup. To create and serve a production build:

```bash
npm run build
npm run preview
```

The available quality command is:

```bash
npm run lint
```

There is currently no dedicated automated unit or end-to-end test script.

## Mock API

The mock request utility in `src/services/mockApi.js` provides an asynchronous delay (300 ms by default), response cloning, pagination helpers, text matching, and simulated failures (3% by default). Domain services expose functions such as `getOrders`, `getOrderById`, `getProducts`, `getAnalytics`, `getAlerts`, and `resolveAlertById`.

List services apply their supported search/filter/sort options and return paginated response metadata. Errors are thrown as `MockApiError` values with a message, status, and code. To make error states reproducible when calling a service, pass `{ simulateError: true }`; pass `{ failureRate: 0 }` to disable random failures for a check. Delay and failure options are intended for the mock service layer, not as production networking controls.

Example:

```js
import { getOrders } from './src/services/ordersService.js'

const response = await getOrders({
  search: 'Jordan',
  status: 'all',
  page: 1,
  pageSize: 10,
})

console.log(response.data, response.meta)
```

React pages call services in effects, represent loading/success/error states, and pass service results to reusable components. The app does not use Express, MongoDB, or a remote API.

## Limitations

- Data is fictional and bundled with the frontend; values are not live store data.
- There is no backend, authentication, authorization, server-side persistence, or real network integration.
- Resolving an alert mutates the in-memory mock dataset only. A reload or app restart resets the change.
- Simulated failures are random by default; a page's service calls may therefore show an error occasionally.
- There is no dedicated automated test suite in the current package scripts. Validation to date includes build/lint and targeted manual smoke/browser checks; see [`PROJECT_REVIEW.md`](./PROJECT_REVIEW.md).
- The `src/hooks/` folder is reserved for future reusable hooks and currently has no implemented hook modules.

## Future improvements

- Add a real API, persistent storage, authentication, and authorization.
- Add automated unit tests for calculations/services and browser-driven tests for key user flows.
- Add server-side pagination and filtering for larger datasets.
- Add operational actions and audit history backed by a server.
- Validate the dashboard with actual stakeholder workflows and measure outcome metrics.
- Consider removing or wiring the currently unused derived `salesAnalytics.js` fixture when the data strategy is finalized.

## Supervisor demonstration plan

1. Start the app and introduce the operations problem and the intended stakeholder.
2. Show Overview KPIs, the revenue/order charts, recent orders, and the alerts preview; explain that values come from the mock service/data layer.
3. Demonstrate Orders search, a status/date filter, sorting, pagination, and opening/closing an order’s details.
4. Apply an Analytics date range and show how the summary and charts recalculate; then filter inventory and resolve an alert using the confirmation dialog.
5. Close with the build/lint and browser validation evidence, followed by limitations: mock data, in-memory alert changes, and no automated test suite or production backend.
