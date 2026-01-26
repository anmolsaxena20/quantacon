import ChatWindow from "@/components/chat/ChatWindow";


const dummyUser = {
name: "Alex",
image: "https://i.pravatar.cc/150",
};


export default function Chat() {
return (
<div className="h-screen bg-background p-4">
<ChatWindow user={dummyUser} />
</div>
);
}