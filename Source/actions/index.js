import { RS_ADD_VIDEO, RS_REMOVE_VIDEO, RS_QUEUED_VIDEOS, RS_APP_SETTINGS, RS_URL_ENTRY_SAVE_STATE } from '../models/Constants';

export const addVideo = video => ({
    type: RS_ADD_VIDEO,
    video: video
})

export const removeVideo = index => ({
    type: RS_REMOVE_VIDEO,
    index: index
})

export const queuedVideoCount = count => ({
    type: RS_QUEUED_VIDEOS,
    count: count
})

export const appSettings = settings => ({
    type: RS_APP_SETTINGS,
    settings: settings
})

export const urlEntryState = state => ({
    type: RS_URL_ENTRY_SAVE_STATE,
    state: state
})