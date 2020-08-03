import { useDispatch, useSelector } from 'react-redux';

import useInterval from '../hooks/useInterval';

import { queuedVideoCount } from '../actions';

const DownloadManager = () => {
    const videos = useSelector((state) => state.videos);
    const queuedVideoTotal = useSelector((state) => state.queuedVideoCount);

    const dispatch = useDispatch();

    const canNewDownloadBeStarted = () => {
        const maxActiveDownloads = 3;  

        const activeDownloads = videos.reduce((total, item) => (item.isActive() ? total + 1 : total), 0);

        const pendingDownloads = videos.reduce((total, item) => (item.isPending() ? total + 1 : total), 0);

        if (activeDownloads + pendingDownloads !== queuedVideoTotal) {
            dispatch(queuedVideoCount(activeDownloads + pendingDownloads));
        }

        return activeDownloads < maxActiveDownloads && pendingDownloads > 0;
    };

    const startNewDownload = () => {
        if (canNewDownloadBeStarted()) {
            const video = videos.find((item) => item.isPending());

            video.start();
        }
    };

    const cancelStalledDownloads = () => {
        videos.forEach((item) => {
            if (item.noContentDownloadedInLastTenSeconds()) {
                item.cancel();
            }
        });
    };

    useInterval(() => {
        cancelStalledDownloads();
        startNewDownload();
    }, 1000);

    return null;
};

export default DownloadManager;