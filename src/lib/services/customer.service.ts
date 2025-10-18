import { recordAdminAction } from "./audit.service";

const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

export const sendEmailToCustomer = async (params: {
  customerId: string;
  to: string;
  subject: string;
  message: string;
  adminId: string;
}) => {
  const { customerId, to, subject, adminId } = params;

  console.info(`[customer] Sending email to ${customerId} -> ${to}`);
  await sleep(500);

  await recordAdminAction({
    action: "email_sent",
    adminId,
    timestamp: new Date().toISOString(),
    metadata: { customerId, to, subject },
  });
};

export const callCustomer = async (params: {
  customerId: string;
  phoneNumber: string;
  adminId: string;
}) => {
  const { customerId, phoneNumber, adminId } = params;

  if (!phoneNumber) {
    throw new Error("Missing phone number");
  }

  console.info(`[customer] Calling phone ${phoneNumber} for ${customerId}`);
  await sleep(300);

  await recordAdminAction({
    action: "call_initiated",
    adminId,
    timestamp: new Date().toISOString(),
    metadata: { customerId, phoneNumber },
  });
};

export const disableCustomerAccount = async (params: {
  customerId: string;
  adminId: string;
}) => {
  const { customerId, adminId } = params;

  console.info(`[customer] Disabling account ${customerId}`);
  await sleep(600);

  await recordAdminAction({
    action: "account_disabled",
    adminId,
    timestamp: new Date().toISOString(),
    metadata: { customerId },
  });
};
