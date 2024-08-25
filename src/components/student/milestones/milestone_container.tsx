import React from 'react'

interface CardContainerProps {
  title: string
  children: React.ReactNode
}

const CardContainer: React.FC<CardContainerProps> = ({ title, children }) => {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
      <h2 style={{ marginBottom: '16px' }}>{title}</h2>
      {children}
    </div>
  )
}

export default CardContainer
