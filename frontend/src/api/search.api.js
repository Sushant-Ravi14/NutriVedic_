import client from './client';

export const getFoodSuggestionsApi = async (query) => {
  const res = await client.get(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
  return res.data;
};

export const searchFoodApi = async (query) => {
  const res = await client.get(`/api/search/food?q=${encodeURIComponent(query)}`);
  return res.data;
};
