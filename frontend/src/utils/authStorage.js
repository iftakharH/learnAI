export const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');

  if (!storedUser) {
    return null;
  }

  try {
    const user = JSON.parse(storedUser);
    return user?.token ? user : null;
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
};

export const setStoredUser = (user) => {
  if (!user?.token) {
    throw new Error('Authentication response did not include a token');
  }

  localStorage.setItem('user', JSON.stringify(user));
};

export const clearStoredUser = () => {
  localStorage.removeItem('user');
};
