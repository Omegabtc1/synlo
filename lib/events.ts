export type TicketTier = { name: string; desc: string; price: string };

export type SynloEvent = {
  id: string;
  title: string;
  category: string;
  categoryTag: string;
  emoji: string;
  gradient: string;
  city: string;
  location: string;
  date: string;
  time: string;
  price: string;
  priceNum: number;
  description: string;
  tickets: TicketTier[];
};

export const events: SynloEvent[] = [
  {
    id: "lagos-tech",
    title: "Lagos Tech Connect",
    category: "Tech",
    categoryTag: "tag-tech",
    emoji: "💻",
    gradient: "gradient-1",
    city: "Lagos",
    location: "The Zone, Lagos Island, Lagos",
    date: "April 12, 2026",
    time: "10:00 AM – 6:00 PM",
    price: "₦5,000",
    priceNum: 5000,
    description:
      "Lagos Tech Connect is Nigeria's premier monthly gathering for founders, developers, designers, and creatives. Network with 500+ of the brightest minds in tech, hear from industry-leading speakers, and forge partnerships that could define your next chapter. Whether you're a startup founder looking for co-founders, a developer hunting for your dream team, or an investor scouting the next big thing — this is your room.",
    tickets: [
      { name: "Regular", desc: "General admission + networking", price: "₦5,000" },
      { name: "VIP", desc: "Front row, speaker access, dinner & drinks", price: "₦15,000" },
    ],
  },
  {
    id: "abuja-creators",
    title: "Abuja Creators Meetup",
    category: "Creative",
    categoryTag: "tag-creative",
    emoji: "🎨",
    gradient: "gradient-2",
    city: "Abuja",
    location: "Art Café, Maitama, Abuja",
    date: "April 19, 2026",
    time: "2:00 PM – 9:00 PM",
    price: "₦3,500",
    priceNum: 3500,
    description:
      "The Abuja Creators Meetup brings together artists, photographers, content creators, filmmakers, and fashion designers in the capital city for an afternoon of collaboration, showcase, and inspiration. Display your work, get feedback from peers, and discover collaborations you never expected. Featuring live art installations, portfolio reviews, and an open mic session.",
    tickets: [
      { name: "Regular", desc: "Full event access + showcase entry", price: "₦3,500" },
      { name: "VIP", desc: "Showcase booth + portfolio feature + gift bag", price: "₦10,000" },
    ],
  },
  {
    id: "owerri-campus",
    title: "Owerri Campus Fest",
    category: "Campus",
    categoryTag: "tag-campus",
    emoji: "🎓",
    gradient: "gradient-3",
    city: "Owerri",
    location: "Federal Polytechnic, Owerri, Imo State",
    date: "April 26, 2026",
    time: "12:00 PM – 10:00 PM",
    price: "₦2,000",
    priceNum: 2000,
    description:
      "Owerri Campus Fest is the south-east's most electric student festival — a full day of live performances, competitions, food, fun, and pure unadulterated vibes. Featuring top Nigerian artists, student showcases, gaming tournaments, and the popular \"Campus Idol\" talent competition. This is where memories are made and friendships last a lifetime.",
    tickets: [
      { name: "Regular", desc: "Event access + food voucher", price: "₦2,000" },
      { name: "VIP", desc: "VIP lounge + meet & greet + merch", price: "₦7,500" },
    ],
  },
  {
    id: "ph-music",
    title: "Port Harcourt Sounds",
    category: "Music",
    categoryTag: "tag-music",
    emoji: "🎵",
    gradient: "gradient-4",
    city: "Port Harcourt",
    location: "Garden City Pavilion, Port Harcourt",
    date: "May 3, 2026",
    time: "6:00 PM – 12:00 AM",
    price: "₦8,000",
    priceNum: 8000,
    description:
      "Port Harcourt Sounds is an electrifying music festival celebrating the rich musical culture of the Niger Delta. Featuring Afrobeats, Afropop, and emerging local acts alongside established headliners, this is your night to dance, connect, and experience live music at its finest.",
    tickets: [
      { name: "Regular", desc: "General floor access", price: "₦8,000" },
      { name: "VIP", desc: "VIP section + artist meet & greet + 2 drinks", price: "₦20,000" },
    ],
  },
  {
    id: "ibadan-food",
    title: "Ibadan Food Festival",
    category: "Food",
    categoryTag: "tag-food",
    emoji: "🍲",
    gradient: "gradient-5",
    city: "Ibadan",
    location: "Agodi Gardens, Ibadan, Oyo State",
    date: "May 10, 2026",
    time: "11:00 AM – 7:00 PM",
    price: "₦4,000",
    priceNum: 4000,
    description:
      "Celebrate the incredible flavours of Nigeria at the Ibadan Food Festival. 50+ food vendors, cooking competitions, celebrity chef demonstrations, and unlimited tastings. From jollof rice cook-offs to pepper soup challenges — if you love food, you'll love this event.",
    tickets: [
      { name: "Regular", desc: "Entry + ₦2,000 food tokens", price: "₦4,000" },
      { name: "VIP", desc: "Premium entry + ₦6,000 tokens + chef masterclass", price: "₦12,000" },
    ],
  },
  {
    id: "lagos-biz",
    title: "Lagos Business Summit",
    category: "Business",
    categoryTag: "tag-biz",
    emoji: "📈",
    gradient: "gradient-6",
    city: "Lagos",
    location: "Eko Hotel, Victoria Island, Lagos",
    date: "May 17, 2026",
    time: "8:00 AM – 5:00 PM",
    price: "₦25,000",
    priceNum: 25000,
    description:
      "The Lagos Business Summit convenes Africa's most influential entrepreneurs, executives, and investors for a full day of strategy, innovation, and deal-making. Keynotes, panel sessions, and curated one-on-one networking. If you're serious about scaling your business in 2026, this is where you need to be.",
    tickets: [
      { name: "Regular", desc: "All sessions + lunch + networking", price: "₦25,000" },
      { name: "VIP Executive", desc: "All sessions + VIP dinner + investor matchmaking", price: "₦75,000" },
    ],
  },
  {
    id: "abuja-comedy",
    title: "Abuja Laughs Out Loud",
    category: "Comedy",
    categoryTag: "tag-creative",
    emoji: "😂",
    gradient: "gradient-7",
    city: "Abuja",
    location: "Transcorp Hilton, Abuja",
    date: "May 24, 2026",
    time: "7:00 PM – 11:00 PM",
    price: "₦10,000",
    priceNum: 10000,
    description:
      "Nigeria's funniest comedians take the stage in Abuja for a night of non-stop laughter. Featuring 8 top acts, surprise celebrity guests, and the energy only a live comedy show can give. Come with your squad, sit back, and let go of every stress.",
    tickets: [
      { name: "Regular", desc: "Standard seating", price: "₦10,000" },
      { name: "VIP", desc: "Front tables + dinner + meet & greet", price: "₦30,000" },
    ],
  },
  {
    id: "lagos-fashion",
    title: "Lagos Fashion Week",
    category: "Fashion",
    categoryTag: "tag-creative",
    emoji: "👗",
    gradient: "gradient-1",
    city: "Lagos",
    location: "Federal Palace Hotel, Lagos",
    date: "June 5, 2026",
    time: "3:00 PM – 10:00 PM",
    price: "₦15,000",
    priceNum: 15000,
    description:
      "Celebrating the best of Nigerian and African fashion design. Runway shows from emerging and established designers, pop-up shops, style competitions, and after-parties. The biggest fashion event in West Africa comes to Lagos this June.",
    tickets: [
      { name: "Regular", desc: "Runway shows + exhibition access", price: "₦15,000" },
      { name: "VIP", desc: "Front row + backstage pass + designer meet + gift bag", price: "₦45,000" },
    ],
  },
];

export function getEventById(id: string): SynloEvent | undefined {
  return events.find((e) => e.id === id);
}
