import axios from "axios";

const API_KEY = "SG2UtxNTSq4GCdGyvtKDJXdfHlRsRvrk";
const SECRET_KEY = "5LH1lyZIflv09hshr4EE";
const userEmail = "workingintern.a.t@gmail.com";

axios.post("https://www.buyucoin.com/api/v1/get-user", 
  { email: userEmail },
  {
    headers: {
      "X-API-KEY": API_KEY,
      "X-SECRET-KEY": SECRET_KEY,
      "Content-Type": "application/json",
    },
  }
)
.then(response => console.log("User ID:", response.data.userId))
.catch(error => console.error(error));
