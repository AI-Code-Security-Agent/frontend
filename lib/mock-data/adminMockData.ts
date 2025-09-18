export const adminMockData = {
  totalUsers: 1234,
  activeUsers: 890,
  totalAdmins: 5,
  newUsersToday: 23,
  messageStats: {
    totalMessages: 15670,
    userMessages: 7835,
    assistantMessages: 7835,
    feedbackStats: {
      likes: 4523,
      unlikes: 342,
      likePercentage: 92.96
    }
  },
  usersList: [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', lastActive: '2025-09-12T10:30:00Z' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', lastActive: '2025-09-12T09:45:00Z' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user', lastActive: '2025-09-11T16:20:00Z' },
    // Add more mock users as needed
  ],
  adminsList: [
    { id: 101, name: 'Admin One', email: 'admin1@example.com', role: 'admin', lastActive: '2025-09-12T11:00:00Z' },
    { id: 102, name: 'Admin Two', email: 'admin2@example.com', role: 'admin', lastActive: '2025-09-12T10:15:00Z' },
    // Add more mock admins as needed
  ],
  sessionStats: {
    total: 5678,
    active: 234,
    averageDuration: '25 minutes',
    peakHours: '2PM - 4PM'
  },
  userActivityGraph: [
    { date: '2025-09-06', activeUsers: 750 },
    { date: '2025-09-07', activeUsers: 800 },
    { date: '2025-09-08', activeUsers: 850 },
    { date: '2025-09-09', activeUsers: 900 },
    { date: '2025-09-10', activeUsers: 880 },
    { date: '2025-09-11', activeUsers: 920 },
    { date: '2025-09-12', activeUsers: 890 }
  ]
}