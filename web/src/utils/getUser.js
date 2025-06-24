export const getUser = () => {
    const token = JSON.parse(localStorage.getItem("userInfo")) || null ;
    return token;
};
