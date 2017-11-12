const Videos = (state = [], action) => {
    switch (action.type) {
        case 'ADD_VIDEO':
            let copy = state.slice();
            copy.push(action.video);
            return copy;
        case 'REMOVE_VIDEO':
            state.splice(action.index, 1)
            return state.slice();
        default:
            return state
    }
}

export default Videos