import { SellVehicle } from '@/views/seller/SellVehicle'
import React, { Suspense } from 'react'

export default function EstimatePage() {
  return (
    <Suspense fallback={null}>
      <SellVehicle />
    </Suspense>
  )
}