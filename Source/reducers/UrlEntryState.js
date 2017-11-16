
const UrlEntryState = (state = null, action) => {
    switch (action.type) {
        case 'URL_ENTRY_SAVE_STATE':
            return Object.assign({}, action.screenState);
        default:
            return state
    }
}

export default UrlEntryState