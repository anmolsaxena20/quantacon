import debounce from "lodash.debounce";
import { useCallback, useState } from "react";

export default function UserSearch() {
  const [users, setUsers] = useState([]);

  const searchUsers = async (query) => {
    const res = await fetch(`/users/search?q=${query}`);
    const data = await res.json();
    setUsers(data);
  };

  const debouncedSearch = useCallback(
    debounce(searchUsers, 300),
    []
  );

  return (
    <input
      placeholder="Search users"
      //onChange={(e) => debouncedSearch(e.target.value)}
      className="w-full p-3 rounded-lg bg-muted"
    />
  );
}
