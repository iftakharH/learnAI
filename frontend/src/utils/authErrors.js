export const getAuthErrorMessage = (error, fallback) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (!error.response) {
    return 'Cannot reach the server. Start the backend with "npm run dev" in the backend folder, then try again.';
  }

  return fallback;
};
