export const useNotice = () => {
    // Implement notification event to track notices of interested activities
    const auth = useAuth();

    const notices = useState('noticesList', () => []);
    const fetchNotices = async () => {
        if (!auth.token) return;
        const data = await useApiFetch('/notices',{
            headers : {
                Authorization : `Bearer ${auth.token}`
            }
        })
        notices.value = data;
        console.log(notices.value)
    }
    return {
        noticesList: notices,
        fetchNotices,
    }
}

export default useNotice;