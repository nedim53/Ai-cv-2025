"use client"

import React, { createContext, useContext, useState } from 'react'
import { Snackbar, Alert } from '@mui/material'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
    duration: 4000
  })

  const showNotification = (message, severity = 'success', duration = 4000) => {
    setNotification({
      open: true,
      message,
      severity,
      duration
    })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  const showSuccess = (message, duration = 4000) => {
    showNotification(message, 'success', duration)
  }

  const showError = (message, duration = 4000) => {
    showNotification(message, 'error', duration)
  }

  const showWarning = (message, duration = 4000) => {
    showNotification(message, 'warning', duration)
  }

  const showInfo = (message, duration = 4000) => {
    showNotification(message, 'info', duration)
  }

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideNotification
      }}
    >
      {children}
      
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            background: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }
        }}
      >
        <Alert
          onClose={hideNotification}
          severity={notification.severity}
          variant="filled"
          sx={{
            width: '100%',
            background: notification.severity === 'success' 
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : notification.severity === 'error'
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : notification.severity === 'warning'
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff',
            fontWeight: '600',
            '& .MuiAlert-icon': {
              color: '#fff'
            },
            '& .MuiAlert-action': {
              color: '#fff'
            }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}
