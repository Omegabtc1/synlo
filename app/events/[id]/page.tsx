import { notFound } from "next/navigation";
import { EventDetailView } from "@/components/event-detail-view";
import { events, getEventById } from "@/lib/events";

type Props = { params: Promise<{ id: string }> };

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) notFound();

  return <EventDetailView event={event} backHref="/explore" />;
}

export function generateStaticParams() {
  return events.map((e) => ({ id: e.id }));
}
