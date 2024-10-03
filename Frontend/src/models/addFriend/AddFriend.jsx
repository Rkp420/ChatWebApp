import { useEffect, useState } from "react";
import "./AddFriend.css";
import axios from "axios";


import TopSearchBar from "../../components/common/TopSearchBar";
import CloseModel from "../../components/common/CloseModel";
import User from "../../components/users/User";
import { useUserContext } from "../../context/Usercontext";

export default function AddFriend() {
  const { user } = useUserContext();
  const [users, setAllUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const res = await axios.get(`/api/user/all/${user._id}`);
      if (res.data) {
        setAllUsers(res.data);
      } else {
        setAllUsers([]);
      }
    }
    fetchUsers();
  }, [user]);

  return (
    <div className="add-friend-model">
      <TopSearchBar />
      <CloseModel />
      <ul className="userList">
        {users.map((userinfo) => (
          <li key={userinfo._id} className="listing">
            {userinfo._id !== user._id && <User userData={userinfo} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
