import axiosClient from "../axiosClient";

export const getFavorites = () => {
  return axiosClient.get("/favorites/");
};

export const addFavorite = (recipientUsername, nickname) => {
  return axiosClient.post("/favorites/add/", {
    recipient_username: recipientUsername,
    nickname: nickname || "",
  });
};

export const removeFavorite = (id) => {
  return axiosClient.delete(`/favorites/${id}/remove/`);
};

