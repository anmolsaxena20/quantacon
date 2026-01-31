import ChatWindow from "@/components/chat/ChatWindow";
import { useParams } from "react-router-dom";

const dummyUser = {
name: "Alex",
image: "https://i.pravatar.cc/150",
};


export default function Chat() {
    const{chatId} = useParams();
return (
<div className="h-screen bg-background p-4">
<ChatWindow chatId={chatId} />
</div>
);
}