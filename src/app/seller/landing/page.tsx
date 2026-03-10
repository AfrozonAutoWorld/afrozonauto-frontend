import { SellerLanding } from '@/views/seller/SellerLanding'
import React, { Suspense } from 'react'

const SellerLandingPage = () => {
  return (
    <Suspense fallback={null}>
      <SellerLanding />
    </Suspense>
  )
}

export default SellerLandingPage