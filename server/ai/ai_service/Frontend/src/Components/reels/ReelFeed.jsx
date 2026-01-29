import ReelCard from "./ReelCard";

export default function ReelFeed({ reels }) {
  return (
    <div className="snap-y snap-mandatory h-screen overflow-y-scroll">
      {reels.map((reel) => (
        <ReelCard key={reel._id} video={reel} />
      ))}
    </div>
  );
}
