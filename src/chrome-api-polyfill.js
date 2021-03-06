const alert = console.error;

window.chrome = {
    extension: {
        getURL: uri => uri,
        sendMessage: (data, callback) => {
            if (data.type === 'makehtml' && !data.entry.data) {
                data.entry.data = [];
            }
            try {
                chrome.runtime.onMessage.__listeners.forEach(f => f(data, {tab: {id: 0}}, callback));
            } catch (error) {
                console.error(error.message);
            }
        },
        getBackgroundPage: () => window
    },
    runtime: {
        onMessage: {
            __listeners: [],
            addListener: f => chrome.runtime.onMessage.__listeners.push(f)
        }
    },
    __events: {},
    browserAction: {
        onClicked: {
            __listeners: [],
            addListener: f => chrome.browserAction.onClicked.__listeners.push(f)
        },
        setBadgeBackgroundColor: data => data,
        setBadgeText: data => data
    },
    tabs: {
        sendMessage: (id, data) => chrome.runtime.onMessage.__listeners.forEach(f => f(data, null, null)),
        onSelectionChanged: {
            addListener: f => f(0)
        }
    },
    windows: {
        getAll: (data, f) => f([{tabs: [{id: 0}]}])
    }
};
