import ReelFeed from "@/components/reels/ReelFeed";
import UserSearch from "@/components/search/UserSearch";


export default function Social() {
    const reels = [
  { _id: 2, url: "video2.mp4" }
]

    return (
        <div className="h-screen bg-background flex flex-col">
            {/* <div className="p-4 border-b border-border">
                <UserSearch />
            </div> */}
            <div className="flex-1 overflow-hidden">
                <ReelFeed reels={reels}/>
            </div>
        </div>
    );
}