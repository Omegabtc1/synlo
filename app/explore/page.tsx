import { ExploreClient } from "@/components/explore-client";
import { Footer } from "@/components/footer";
import { events } from "@/lib/events";

export default function ExplorePage() {
  return (
    <>
      <ExploreClient initialEvents={events} />
      <Footer variant="minimal" />
    </>
  );
}
