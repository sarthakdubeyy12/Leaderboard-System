Follow Up Question: -

Once your solution is working, consider the following extension:
The platform wants to support score snapshots — the ability to query what the leaderboard
looked like at any past timestamp (e.g. get_top_k_at(k, timestamp)). How would you
redesign your data structure to support this without breaking your current time
complexities? You do not need to code this — explain your approach.


my approach will be like i willl use an event-sourcing and checkpoint strategy which will Store all score updates in an append-only event log and store a full leaderboard checkpoints in it. Ans to answer the query which is`get_top_k_at(k, timestamp)`i will replay all events up to the last checkpoint before a given timestamp and in this way O(log n) update and top k query efficiency get maintain