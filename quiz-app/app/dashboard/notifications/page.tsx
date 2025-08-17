const dummyNotifications = [
  {
    id: 1,
    title: "Notification 1",
    description: "Description 1",
  },
  {
    id: 2,
    title: "Notification 2",
    description: "Description 2",
  },
];
export default function NotificationsPage() {
  return (
    <div>
      <h1>Notifications</h1>
      <ul>
        {dummyNotifications.map((notification) => (
          <li key={notification.id}>
            <h2>{notification.title}</h2>
            <p>{notification.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
