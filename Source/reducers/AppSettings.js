
const AppSettings = (state = null, action) => {
    switch (action.type) {
        case 'APP_SETTINGS_UPDATE':
            return Object.assign({}, action.appSettings);
        default:
            return state
    }
}

export default AppSettings