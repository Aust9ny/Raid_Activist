export default NotificationEvent = () =>{
    // Implement notification event to track notices of interested activities
    const auth = useAuth();

    const notices= useState('noticesist', () => []);
    const fetchNotices = async (interestList) =>{
        if (!auth.token) return;
        baseURL = process.env.API_BASE_URL;
        const data = await useApiFetch('/notices',{
            headers : {
                Authorization : `Bearer ${auth.token}`
            }
        })
        noticesvalue = data;
        console.log(noticesvalue)
    }
    return {
        noticesists : notices,
        fetchNotices,
    }
}