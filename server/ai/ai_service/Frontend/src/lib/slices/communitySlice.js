import { createSlice } from '@reduxjs/toolkit';

const mockPosts = [
    {
        id: '1',
        userId: 'u1',
        userName: 'Sarah Jenkins',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        content: 'Just smashed my PB on deadlifts! ðŸ‹ï¸â€â™€ï¸ 120kg for 3 reps!',
        timestamp: Date.now() - 1000 * 60 * 30, 
        likes: ['u2', 'u3', 'u4'],
        comments: [
            {
                id: 'c1',
                userId: 'u2',
                userName: 'Mike Ross',
                userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
                content: 'That is insane! Congrats Sarah! ðŸ”¥',
                timestamp: Date.now() - 1000 * 60 * 15,
            }
        ]
    },
    {
        id: '2',
        userId: 'u3',
        userName: 'David Chen',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
        content: 'Anyone want to join for a morning run tomorrow? Planning 5k around the park.',
        timestamp: Date.now() - 1000 * 60 * 60 * 2, 
        likes: ['u1'],
        comments: []
    }
];

const mockUsers = [
    { id: 'u1', name: 'Sarah Jenkins', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'},
    { id: 'u2', name: 'Mike Ross', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'},
    { id: 'u3', name: 'David Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david'},
    { id: 'u4', name: 'Emily White', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily'},
];

const initialState = {
    posts: mockPosts,
    activeUsers: mockUsers,
    loading: false,
    error: null,
};

const communitySlice = createSlice({
    name: 'community',
    initialState,
    reducers: {
        addPost: (state, action) => {
            const newPost = {
                id: Math.random().toString(36).substring(7),
                userId: 'currentUser', 
                userName: 'Guest User',
                userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
                content: action.payload,
                timestamp: Date.now(),
                likes: [],
                comments: []
            };
            state.posts.unshift(newPost);
        },
        toggleLike: (state, action) => {
            const post = state.posts.find(p => p.id === action.payload.postId);
            if (post) {
                const index = post.likes.indexOf(action.payload.userId);
                if (index === -1) {
                    post.likes.push(action.payload.userId);
                } else {
                    post.likes.splice(index, 1);
                }
            }
        },
        addComment: (state, action) => {
            const post = state.posts.find(p => p.id === action.payload.postId);
            if (post) {
                const newComment = {
                    id: Math.random().toString(36).substring(7),
                    userId: 'currentUser',
                    userName: 'Guest User',
                    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
                    content: action.payload.content,
                    timestamp: Date.now()
                };
                post.comments.push(newComment);
            }
        }
    }
});

export const { addPost, toggleLike, addComment } = communitySlice.actions;
export default communitySlice.reducer;