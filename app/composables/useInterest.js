import { baseURL } from "node:process";

export default interestedList = () =>{
    // Implement interested activities to track activitiy's events
    const auth = useAuth();
    const interested = useState('interestedList', () => []);

    const fetchInterested = async () =>{
        if (!auth.token) return;
        baseURL = process.env.API_BASE_URL;
        const data = await useApiFetch('/users/me/interests',{
            headers : {
                Authorization : `Bearer ${auth.token}`
            }
        })
        interested.value = data;
        console.log(interested.value)
    }

    const addInterest = async (activityId) =>{
        if (!auth.token) return;
        baseURL = process.env.API_BASE_URL;
        const data = await useApiFetch(`/users/me/interests/${activityId}`,{
            method : 'POST',
            headers : {
                Authorization : `Bearer ${auth.token}`
            },
            body : {
                activityId : activityId
            }
        })
    }

    const removeInterest = async (activityId) =>{
        if (!auth.token) return;
        baseURL = process.env.API_BASE_URL;
        const data = await useApiFetch(`/users/me/interests/${activityId}`,{
            method : 'DELETE',
            headers : {
                Authorization : `Bearer ${auth.token}`
            },
            body : {
                activityId : activityId
            }
        })
    }

    return {
        interestedList : interested,
        fetchInterested,
        addInterest,
    }
}