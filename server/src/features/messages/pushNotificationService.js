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
    "[Push] VAPID keys are not configured. Closed-tab notifications are disabled."
  );
}

export const savePushSubscription = async (uid, subscription) => {
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    throw new Error("Invalid push subscription");
  }

  await User.updateOne(
    { uid },
    {
      $pull: {
        pushSubscriptions: { endpoint: subscription.endpoint },
      },
    }
  );

  await User.updateOne(
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
    }
  );
};

export const removePushSubscription = async (endpoint) => {
  if (!endpoint) return;
  await User.updateMany(
    { "pushSubscriptions.endpoint": endpoint },
    { $pull: { pushSubscriptions: { endpoint } } }
  );
};

export const sendMessagePushNotifications = async ({
  recipientIds,
  senderName,
  messageText,
  conversationId,
}) => {
  if (!pushConfigured || !recipientIds?.length) return;

  const users = await User.find({ uid: { $in: recipientIds } })
    .select("uid pushSubscriptions")
    .lean();

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
            await removePushSubscription(subscription.endpoint);
          } else {
            console.warn("[Push] Failed to send notification:", err.message);
          }
        }
      })
    )
  );
};
