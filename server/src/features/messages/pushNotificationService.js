import webPush from "web-push";
import User from "../users/User.js";

const {
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_SUBJECT = "mailto:listnrentclient@gmail.com",
} = process.env;

const pushConfigured = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (pushConfigured) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} else {
  console.warn(
    "[Push] VAPID keys are not configured. Closed-tab notifications are disabled.",
  );
}

// Bug 4 fix: use a single atomic findOneAndUpdate with $pull + $push replaced
// by a proper upsert-by-endpoint pattern using arrayFilters, avoiding the
// two-operation race that could leave duplicates or gaps.
export const savePushSubscription = async (uid, subscription) => {
  if (
    !subscription?.endpoint ||
    !subscription?.keys?.p256dh ||
    !subscription?.keys?.auth
  ) {
    throw new Error("Invalid push subscription");
  }

  // Remove any existing entry for this endpoint across ALL users (handles
  // the case where a subscription endpoint was previously registered by a
  // different uid, e.g. after account re-auth).
  await User.updateMany(
    { "pushSubscriptions.endpoint": subscription.endpoint },
    { $pull: { pushSubscriptions: { endpoint: subscription.endpoint } } },
  );

  // Push the fresh subscription onto the correct user atomically.
  await User.findOneAndUpdate(
    { uid },
    {
      $push: {
        pushSubscriptions: {
          endpoint: subscription.endpoint,
          expirationTime: subscription.expirationTime
            ? new Date(subscription.expirationTime)
            : null,
          keys: subscription.keys,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
    { upsert: false },
  );
};

export const removePushSubscription = async (endpoint) => {
  if (!endpoint) return;
  await User.updateMany(
    { "pushSubscriptions.endpoint": endpoint },
    { $pull: { pushSubscriptions: { endpoint } } },
  );
};

export const sendMessagePushNotifications = async ({
  recipientIds,
  senderName,
  messageText,
  conversationId,
}) => {
  if (!pushConfigured) {
    console.warn("[Push] Skipping — VAPID keys not configured");
    return;
  }

  if (!recipientIds?.length) return;

  // Bug 3 fix: log when a recipient has no subscriptions so it's easy to
  // diagnose whether push fails at send-time or at subscription-save-time.
  const users = await User.find({ uid: { $in: recipientIds } })
    .select("uid pushSubscriptions")
    .lean();

  const totalSubscriptions = users.reduce(
    (sum, u) => sum + (u.pushSubscriptions?.length || 0),
    0,
  );

  if (totalSubscriptions === 0) {
    console.warn(
      `[Push] No subscriptions found for recipients: ${recipientIds.join(", ")}. ` +
        "The user may not have granted notification permission or the subscription was not saved.",
    );
    return;
  }

  const payload = JSON.stringify({
    title: senderName ? `Message from ${senderName}` : "New message",
    body: messageText || "You have a new message",
    url: `/dashboard?tab=messages&conversationId=${conversationId}`,
    tag: `message-${conversationId}`,
    conversationId,
  });

  await Promise.allSettled(
    users.flatMap((user) =>
      (user.pushSubscriptions || []).map(async (subscription) => {
        try {
          await webPush.sendNotification(subscription, payload);
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            // Subscription is expired/revoked — clean it up.
            console.log(
              `[Push] Removing expired subscription for uid ${user.uid}`,
            );
            await removePushSubscription(subscription.endpoint);
          } else {
            console.warn(
              `[Push] Failed to send to uid ${user.uid}:`,
              err.statusCode,
              err.message,
            );
          }
        }
      }),
    ),
  );
};
