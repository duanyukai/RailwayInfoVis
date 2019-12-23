
export default function createReducer(injectedReducers = {}) {
  const rootReducer = combineReducers({
    global: globalReducer,
    router: connectRouter(history),
    ...injectedReducers,
  });

  return rootReducer;
}
