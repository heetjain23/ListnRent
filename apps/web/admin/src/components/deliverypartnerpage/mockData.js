export const navTabs = [
  { key: "deliveries", label: "Deliveries" },
  { key: "messages", label: "Messages" },
  { key: "dashboard", label: "Dashboard" },
  { key: "profile", label: "Profile" },
];

export const todayTasks = [
  {
    id: "T-1001",
    type: "delivery",
    badge: "DELIVERY",
    customer: "Priya Sharma",
    seller: "ListnRent Studio",
    buyer: "Priya Sharma",
    time: "10:30 AM",
    address: "Apt 4B, The Imperial Towers, Tardeo, Mumbai 400034",
    item: "Emerald Silk Saree",
    itemId: "#LR-9982",
    rent: 2500,
    deposit: 5000,
    pending: 0,
    status: "active",
  },
  {
    id: "T-1002",
    type: "return",
    badge: "RETURN PICKUP",
    customer: "Rohan Desai",
    seller: "ListnRent Studio",
    buyer: "Rohan Desai",
    time: "12:00 PM",
    address: "Villa 12, Pali Hill, Bandra West, Mumbai 400050",
    item: "Black Velvet Tuxedo",
    itemId: "#LR-8421",
    rent: 3200,
    deposit: 6500,
    pending: 800,
    status: "active",
  },
];

export const futureTasks = [
  {
    id: "T-1003",
    type: "pickup",
    badge: "PICKUP",
    date: "OCT 24",
    time: "9:00 AM",
    location: "Studio Atelier, Lower Parel",
    description: "Collect 4 items for styling shoot",
  },
  {
    id: "T-1004",
    type: "delivery",
    badge: "DELIVERY",
    date: "OCT 25",
    time: "2:30 PM",
    location: "Taj Mahal Palace, Colaba",
    description: "Deliver Bridal Lehenga Set",
  },
];

export const historyTasks = [
  {
    id: "T-0998",
    type: "delivery",
    badge: "DELIVERY",
    customer: "Kavita Singh",
    item: "Gold Bangles",
    completedAt: "5:30 PM",
  },
  {
    id: "T-0997",
    type: "pickup",
    badge: "PICKUP",
    customer: "Aarav Shah",
    item: "Silk Sherwani",
    completedAt: "3:15 PM",
  },
];

export const conversations = [
  {
    id: "C-1",
    name: "Aarav Patel",
    subtitle: "Pickup: Emerald Necklace",
    preview:
      "Hi, I am ready with the Emerald Necklace for return. Are you nearby?",
    time: "10:42 AM",
    location: "Pickup: Lodha Bellissimo, Mahalaxmi",
    messages: [
      {
        by: "customer",
        text: "Hi, I am ready with the Emerald Necklace for return. Are you nearby?",
        time: "10:30 AM",
      },
      {
        by: "partner",
        text: "Yes, I am about 5 minutes away. I'll call you when I reach the gate.",
        time: "10:32 AM",
      },
      {
        by: "customer",
        text: "Perfect. I'm waiting by the main gate of the complex.",
        time: "10:42 AM",
      },
    ],
  },
  {
    id: "C-2",
    name: "Priya Sharma",
    subtitle: "Delivery: Silk Lehenga",
    preview: "Can you leave it with the security guard?",
    time: "09:15 AM",
    location: "Delivery: Imperial Towers, Tardeo",
    messages: [],
  },
  {
    id: "C-3",
    name: "Rohan Desai",
    subtitle: "Return: Velvet Sherwani",
    preview: "Thanks for the smooth pickup!",
    time: "Yesterday",
    location: "Return: Pali Hill, Bandra",
    messages: [],
  },
  {
    id: "C-4",
    name: "Kavita Singh",
    subtitle: "Delivery: Gold Bangles",
    preview: "I will be home after 5 PM.",
    time: "Mon",
    location: "Delivery: Breach Candy, Mumbai",
    messages: [
      {
        by: "customer",
        text: "Hi, I am ready with the Emerald Necklace for return. Are you nearby?",
        time: "10:30 AM",
      },
      {
        by: "partner",
        text: "Yes, I am about 5 minutes away. I'll call you when I reach the gate.",
        time: "10:32 AM",
      },
      {
        by: "customer",
        text: "Perfect. I'm waiting by the main gate of the complex.",
        time: "10:42 AM",
      },
    ],
  },
];

export const profileData = {
  firstName: "Arjun",
  lastName: "Desai",
  email: "arjun.desai@example.com",
  phone: "+91 98765 43210",
  address: "402, Sea View Apartments, Bandra West, Mumbai, Maharashtra 400050",
};
