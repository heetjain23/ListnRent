import { api } from "./api";

const BASE = "/api/disputes";

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const getMyDisputes = async (params = {}) => {
  return api(`${BASE}/my${buildQuery(params)}`, { auth: true });
};

export const getDispute = async (disputeId) => {
  return api(`${BASE}/${encodeURIComponent(disputeId)}`, { auth: true });
};

export const getDisputeMessages = async (disputeId, page = 1, limit = 30) => {
  return api(
    `${BASE}/${encodeURIComponent(disputeId)}/messages${buildQuery({ page, limit })}`,
    { auth: true },
  );
};

export const createDispute = async (payload) => {
  return api(`${BASE}/create`, {
    auth: true,
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const sendDisputeMessage = async (disputeId, message) => {
  return api(`${BASE}/${encodeURIComponent(disputeId)}/message`, {
    auth: true,
    method: "POST",
    body: JSON.stringify({ message }),
  });
};

export const confirmDisputeResolved = async (disputeId) => {
  return api(`${BASE}/${encodeURIComponent(disputeId)}/confirm-resolved`, {
    auth: true,
    method: "POST",
    body: JSON.stringify({}),
  });
};

export const reopenDispute = async (disputeId) => {
  return api(`${BASE}/${encodeURIComponent(disputeId)}/reopen`, {
    auth: true,
    method: "POST",
    body: JSON.stringify({}),
  });
};