import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import reducer, { initialState } from './reducers';
import Camera from './Camera';

const store = createStore(reducer, initialState, applyMiddleware(thunk));

const App = () => {
    return (
        <Provider store={store}>
                <Camera />
        </Provider>
    )
}

export default App;