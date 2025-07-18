import { useMutation, useQuery, useQueryClient }  from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getOutgoingFriendReqs, getRecommendedUsers, getUserFriends, sendFriendRequest } from "../lib/api";
const HomePage = () => {

    const queryClient = useQueryClient();
    const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

    const { data : friends = [], isLoading : loadingFriends } = useQuery({
        queryKey : ["friends"],
        queryFn : getUserFriends,
    });

    const { data : recommendedUsers = [], isLoading : loadingUsers } = useQuery({
        queryKey : ["users"],
        queryFn : getRecommendedUsers,
    });

    const { data : outgoingFriendReqs} = useQuery({
        queryKey : ["outgoingFriendReqs"],
        queryFn : getOutgoingFriendReqs,
    });

    const { mutate : sendRequestMutation, isPending } = useMutation({
        mutationFn : sendFriendRequest,
        onSuccess : () => queryClient.invalidateQueries({
            queryKey : ["outgoingFriendReqs"]
        }),
    });

    useEffect(() => {
        const outgoingIds = new Set();
        if(outgoingFriendReqs && outgoingFriendReqs.length > 0){
            outgoingFriendReqs.forEach((req) => {
                outgoingIds.add(req.recipient._id);
            });
            setOutgoingRequestsIds(outgoingIds);
        }
    }, [outgoingFriendReqs])
    return (
        <div>HomePage</div>
    )
}

export default HomePage