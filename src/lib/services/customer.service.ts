const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export const sendEmailToCustomer = async (customerId: string) => {
  console.info(`[customer] Sending email to ${customerId}`);
  await sleep(500);
};

export const callCustomer = async (customerPhone: string) => {
  console.info(`[customer] Calling phone ${customerPhone}`);
  await sleep(300);
};

export const disableCustomerAccount = async (customerId: string) => {
  console.info(`[customer] Disabling account ${customerId}`);
  await sleep(600);
};
