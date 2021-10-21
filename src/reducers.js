/* eslint-disable no-console */
/* eslint-disable no-lone-blocks */
import * as tf from '@tensorflow/tfjs';
export const initialState = {
    modalData: null
};

export default function reducer(state = initialState, action) {
    const { payload } = action;
    let finalState = null;
    switch (action.type) {
        case 'SET_DATA': {
            debugger
            finalState = {
                ...state,
                modalData: payload
            }
        }
            break;
        default:
            finalState = state;
    }
    return finalState;
}

export const setModalData = (amount) => {

    return (dispatch) => new Promise(async (success, failure) => {
        let modal = await tf.loadGraphModel("https://vmaker-app.s3.us-west-2.amazonaws.com/api/static/vm_bg.json");
        dispatch({
            type: 'SET_DATA',
            payload: modal
        })
    })
}