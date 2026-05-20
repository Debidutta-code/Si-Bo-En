import SpaClient from "./SpaClient";

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  // Returning empty list because spa IDs are dynamic and fetched at runtime.
  return [];
}

export default function Page({ params }: { params: { spaId: string } }) {
  return <SpaClient params={params} />;
}
