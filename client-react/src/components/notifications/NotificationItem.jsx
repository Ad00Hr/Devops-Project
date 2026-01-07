import React from 'react'

const NotificationItem = ({ notification = {} }) => {
  const { id, title, body, time } = notification
  return (
    <div data-testid={`notification-item-${id ?? ''}`}>
      <div>{title ?? 'Titre de notification'}</div>
      <div>{body ?? ''}</div>
      <small>{time ?? ''}</small>
    </div>
  )
}

export default NotificationItem
