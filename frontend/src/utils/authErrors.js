export const getAuthErrorMessage = (error, fallback) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (!error.response) {
    return 'We are having trouble reaching our servers. Please check your connection and try again in a moment.';
  }

  if (error.response.status >= 500) {
    return 'Something went wrong on our end. Please try again shortly.';
  }

  return fallback;
};
