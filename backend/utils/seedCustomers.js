const randomName = () => {
  const firstNames = [
    "John",
    "Jane",
    "Alex",
    "Emily",
    "Chris",
    "Katie",
    "Michael",
    "Sarah",
    "David",
    "Laura",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Martinez",
    "Lopez",
  ];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
    lastNames[Math.floor(Math.random() * lastNames.length)]
  }`;
};

const randomEmail = (name) => {
  const domains = ["example.com", "mail.com", "test.org", "demo.net"];
  return (
    name.toLowerCase().replace(/ /g, ".") +
    "@" +
    domains[Math.floor(Math.random() * domains.length)]
  );
};

const randomPhone = () => {
  return (
    "+1" +
    Math.floor(100 + Math.random() * 900) +
    "" +
    Math.floor(100 + Math.random() * 900) +
    "" +
    Math.floor(1000 + Math.random() * 9000)
  );
};

const randomOutstandingAmount = () => {
  return parseFloat((Math.random() * 1000).toFixed(2));
};

const randomDueDate = () => {
  const now = new Date();
  const daysToAdd = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
  const due = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return due.toISOString();
};

const randomPaymentStatus = () => {
  const statuses = ["pending", "paid", "overdue"];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const randomDateTimeAroundNow = (days = 20) => {
  const now = new Date();
  const offsetDays = -Math.floor(Math.random() * days + 1); // Only negative offset, up to -days
  const offsetMs = Math.floor(Math.random() * 24 * 60 * 60 * 1000); // random ms in a day
  const date = new Date(
    now.getTime() + offsetDays * 24 * 60 * 60 * 1000 + offsetMs
  );
  return date.toISOString();
};

const seedCustomers = async (createDoc, count = 75) => {
  const customers = [];
  for (let i = 0; i < count; i++) {
    const name = randomName();
    const randDate = randomDateTimeAroundNow(10);
    const customer = {
      name,
      contact_info: {
        email: randomEmail(name),
        phone: randomPhone(),
      },
      outstanding_amount: randomOutstandingAmount(),
      due_date: randomDueDate(),
      payment_status: randomPaymentStatus(),
      created_at: randDate,
      updated_at: randDate,
    };
    customers.push(customer);
  }
  // Insert all customers
  for (const customer of customers) {
    await createDoc("customers", customer);
  }
  console.log(`${customers.length} dummy customers seeded.`);
};

module.exports = { seedCustomers };
