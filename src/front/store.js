export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };

    case "add_task":
      const { id, color } = action.payload;
      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo
        ),
      };

    case "set_jwt":
      return {
        ...store,
        session: {
          token: action.payload.jwt,
          user: action.payload.user,
        },
      };

    case "logout":
      return {
        ...store,
        session: { token: null, user: null },
      };

    default:
      return store;
  }
}

export const initialStore = () => {
  return {
    message: null,
    session: {
      token: null,
      user: null,
    },
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      },
    ],
  };
};
