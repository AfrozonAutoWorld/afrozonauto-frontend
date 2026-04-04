import { SellerListingDetail } from '@/views/seller/SellerListingDetail';

type PageProps = {
  params: { id: string };
};

export default function SellerListingPage({ params }: PageProps) {
  return <SellerListingDetail listingId={params.id} />;
}
