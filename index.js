function counterReducer(state = 0, action) {
  switch (action.type) {
    case 'Increment':
      return state + 1;
    case 'Decrement':
      return state - 1;
    default:
      return state;
  }
}

function compose(...funcs) {
  let res = funcs.reduce((a, b) => {
    return (...args) => {
      return a(b(...args));
    };
  });
  return res;
}
{
  /*


 next is a crashReport function as argument to the loggerDispatch function
 function loggerDispatch(next) {
    return function loggerAction(action) {
      console.log('dispatching:', action);
      let res = next(action);
      return res;
    };
  };

*/
}

function createStore(reducer, preloadState, enhancers) {
  if (typeof enhancers == 'function') {
    return enhancers(createStore)(reducer, preloadState);
  }
  let state = preloadState;
  let listieners = [];

  function subscribe(listiner) {
    listieners.push(listiner);
  }

  function getState() {
    return state;
  }

  function dispatch(action) {
    if (typeof action === 'undefined') {
      throw new Error('Action Must be a plain Object');
    }
    state = reducer(state, action);
    for (let i = 0; i < listieners.length; i++) {
      listieners[i]();
    }
  }

  dispatch({ type: 'Init' });
  return {
    dispatch,
    getState,
    subscribe,
  };
}

function middelware(...middelwares) {
  return function middelwareStore(createStore) {
    return function (...args) {
      console.log('mmmmm');
      const store = createStore(...args);
      const middelwareAPI = {
        //  / getState: store.getState,
        // dispatch: (...args) => {
        //   console.log('----',args);
        //   // return dispatch(...args)
        // },
      };

      const chain = middelwares.map((middelware) => {
        return middelware(middelwareAPI);
      });
      const dispatch = compose(...chain)(store.dispatch);

      // middelwares = middelwares.slice();
      // middelwares.reverse();

      // middelwares.forEach((middelware) => {
      //   dispatch = middelware(store)(dispatch);
      // });
      return {
        ...store,
        dispatch,
      };
    };
  };
}

let store = createStore(
  counterReducer,
  0,
  compose(middelware(logger), monitorReducerEnhancer)
);

store.subscribe(() => {
  console.log('State:', store.getState());
});

function monitorReducerEnhancer(store) {
  return function monitoredReducernnnn(reducer, initialState, enhancer) {
    function monitoredReducer(state, action) {
      const round = (number) => Math.round(number * 100) / 100;
      const start = performance.now();
      const newState = reducer(state, action);
      const end = performance.now();
      const diff = round(end - start);

      console.log('reducer process time:', diff);

      return newState;
    }
    return createStore(monitoredReducer, initialState, enhancer);
  };
}

// function logger(store) {
//   let next = store.dispatch;
//   store.dispatch = function (action) {
//     console.log('Action: ', action);
//     return next(action);
//   };
// }

function logger() {
  return function loggerDispatch(next) {
    return function loggerAction(action) {
      console.log(action);
      let res = next(action);
      return res;
    };
  };
}

// function crashReport(store) {
//   let next = store.dispatch;
//   store.dispatch = function (action) {
//     try {
//       return next(action);
//     } catch (err) {
//       console.log('store: ', store.getState());
//       throw err;
//     }
//   };
// }

function crashReport() {
  return function crashReportDispatch(next) {
    return function crashReportAction(action) {
      try {
        return next(action);
      } catch (err) {
        console.log('store: ', store.getState());
        throw err;
      }
    };
  };
}

// logger(store);
// crashReport(store);

// function mymiddelWare(store, middelwares) {
//   middelwares = middelwares.slice();
//   middelwares.reverse();
//   middelwares.forEach((middelware) => (middelware(store)));
// }

// function mymiddelWare(store, middelwares) {
//   middelwares = middelwares.slice();
//   middelwares.reverse();
//   let dispatch = store.dispatch;
//   middelwares.forEach((middelware) => (dispatch = middelware(store)(dispatch)));
// }

// mymiddelWare(store, [logger, crashReport]);

store.dispatch({ type: 'Increment' });
store.dispatch({ type: 'Increment' });
