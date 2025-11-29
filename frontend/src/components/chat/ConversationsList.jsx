import Conversation from "./Conversation";

function ConversationsList({
  conversations = [],
  loading,
  onlineUsers = [],
  onSearchSubmit,
  searchText,
  setSearchText,
  searchingLoading,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Your Conversations 😍
        </h2>

        <form onSubmit={onSearchSubmit} className="mt-3">
          <div className="flex items-center gap-2">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search User 🥰"
              className="flex-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100"
            />
            <button
              type="submit"
              disabled={searchingLoading}
              className="w-10 h-10 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition"
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="overflow-y-auto grow">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="h-3 w-3/5 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-2 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2 divide-y divide-gray-100 dark:divide-gray-700">
            {conversations.map((c) => (
              <Conversation
                key={c._id}
                conversation={c}
                isOnline={onlineUsers.includes(c.participants[0]?._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversationsList;
