import React from 'react'
import { NotificationItem } from './'

const NotificationFeed = ({ notifications = [] }) => {
  return (
    <div data-testid="notification-feed">
      {notifications.map((n) => (
        <NotificationItem key={n.id ?? n.timestamp ?? Math.random()} notification={n} />
      ))}
    </div>
  )
}

export default NotificationFeed
