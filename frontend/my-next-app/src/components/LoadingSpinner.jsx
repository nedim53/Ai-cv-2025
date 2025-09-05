"use client"

import React from 'react'
import { Box, CircularProgress, Typography, Fade } from '@mui/material'

const LoadingSpinner = ({ 
  loading = false, 
  message = "Analiziram CV...", 
  size = 60,
  overlay = true 
}) => {
  if (!loading) return null

  const spinnerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        p: 4,
        ...(overlay && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
        })
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer rotating ring */}
        <CircularProgress
          size={size + 20}
          thickness={2}
          sx={{
            color: 'rgba(229, 9, 20, 0.3)',
            position: 'absolute',
          }}
        />
        
        {/* Inner rotating ring */}
        <CircularProgress
          size={size}
          thickness={3}
          sx={{
            color: '#e50914',
            animation: 'spin 1.5s linear infinite',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: '#e50914',
              animation: 'spin 1s linear infinite reverse',
            }
          }}
        />
        
        {/* Center dot */}
        <Box
          sx={{
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#e50914',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      </Box>
      
      <Typography
        variant="h6"
        sx={{
          color: '#f5f5f1',
          fontWeight: 600,
          textAlign: 'center',
          animation: 'fadeInOut 2s ease-in-out infinite',
        }}
      >
        {message}
      </Typography>
      
      <Typography
        variant="body2"
        sx={{
          color: '#aaaaaa',
          textAlign: 'center',
          maxWidth: 300,
        }}
      >
        Molimo sačekajte dok AI analizira vaš CV...
      </Typography>
    </Box>
  )

  return (
    <Fade in={loading} timeout={300}>
      {spinnerContent}
    </Fade>
  )
}

export default LoadingSpinner
