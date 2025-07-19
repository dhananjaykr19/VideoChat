import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { acceptFriendRequest, getFriendRequests } from "../lib/api";

const NotificationPage = () => {
    const queryClient = useQueryClient();

    const { data : friendRequests, isLoading } = useQuery({
        queryKey : ["friendRequests"],
        queryFn : getFriendRequests,
    });

    const { mutate : acceptRequestMutation, isPending } = useMutation({
        mutationFn : acceptFriendRequest,
        onSuccess : () => {
            queryClient.invalidateQueries({
                queryKey : ["friendRequests"]
            });
            queryClient.invalidateQueries({
                queryKey : ["friends"]
            });
        },
    });

    const incomingRequests = friendRequests?.incomingReqs || [];
    const acceptedRequests = friendRequests?.acceptRequest || [];
    
    return (
        <div>NotificationPage</div>
    )
}

export default NotificationPage