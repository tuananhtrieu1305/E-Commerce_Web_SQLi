export const getUserId = () => {
  const userStr = localStorage.getItem("user_data"); 
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    return user.id;
  } catch (error) {
    return null;
  }
};

