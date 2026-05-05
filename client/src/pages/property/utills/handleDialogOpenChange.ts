export const handleDialogOpenChange = (open: boolean, fetchUsers: () => void,setSelectedUser: (user: string) => void) => {
    fetchUsers()
    if (!open) {
        setSelectedUser('');
    }
};