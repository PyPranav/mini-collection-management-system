const cron = require('node-cron');
const { searchDocs } = require('../dbconfig');
const { createNotificaiton } = require('./notifications');

// Helper to get yesterday's date in YYYY-MM-DD format
function getYesterdayDateString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  // Pad month and day
  const yyyy = yesterday.getFullYear();
  const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
  const dd = String(yesterday.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function checkDueDatesAndNotify() {
  const yesterdayStr = getYesterdayDateString();
  try {
    // Query customers whose due_date is yesterday and not paid
    const result = await searchDocs('customers', {
      query: {
        bool: {
          must: [
            { term: { due_date: yesterdayStr } },
            { bool: { must_not: { term: { payment_status: 'paid' } } } }
          ]
        }
      }
    });
    const customers = result.hits.hits;
    for (const customerDoc of customers) {
      const customer = customerDoc._source;
      await createNotificaiton(
        'dueDatePassed',
        'Customer due date passed',
        `${customer.name} has crossed the due date`,
        `${customer.name} has crossed the due date`
      );
    }
    if (customers.length > 0) {
      console.log(`Due date notifications created for ${customers.length} customers.`);
    }
  } catch (err) {
    console.error('Error running due date cron job:', err);
  }
}

// Schedule to run every day at 1am
cron.schedule('0 1 * * *', checkDueDatesAndNotify);
