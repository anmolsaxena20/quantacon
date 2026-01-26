import { useInView } from "react-intersection-observer";

export default function ReelCard({ video }) {
  const { ref, inView } = useInView({ threshold: 0.6 });

  return (
    <div ref={ref} className="h-screen flex items-center justify-center">
      <video
        src={video.url}
        className="h-full w-full object-cover"
        autoPlay={inView}
        muted
        loop
        playsInline
      />
    </div>
  );
}
