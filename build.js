const fs = require('fs');
const copy = require('recursive-copy');
const http = require('https');
const unzip = require('unzip');
const rimraf = require('rimraf');
const config = require('./package.json');

const version = 'v' + config.devDependencies.electron.replace(/[^0-9.]/g, '');
const baseUrl = `https://github.com/electron/electron/releases/download/${version}`;

const path = (...args) => path.path.join(__dirname, ...args);
path.path = require('path');

const fetch = (url, callback) => http.get(url, response => {
    if (response.statusCode >= 400) {
        throw `${response.statusCode} ${response.statusMessage}`;
    } else if (response.statusCode >= 300) {
        fetch(response.headers.location, callback);
    } else {
        callback(response);
    }
});

for (const directory of ['cache', 'dist']) {
    const dirPath = path(directory);
    if (!fs.existsSync(dirPath)) {
        console.log(`Creating ${directory} directory in ${dirPath}`);
        fs.mkdirSync(dirPath);
    }
}

const process = (platform, zipPath) => {
    const dist = path('dist', platform);

    if (fs.existsSync(dist)) {
        console.log(`Deleting old ${platform} distribution directory ${dist}`);
        return rimraf(dist, () => process(platform, zipPath));
    }

    console.log(`Unpacking ${platform} binaries in ${dist}`);
    fs.createReadStream(zipPath)
        .pipe(unzip.Extract({path: `${dist}`}))
        .on('close', () => {
            let sourcePath = path('dist', platform, 'resources', 'app', 'src');
            if (platform === 'darwin-x64') {
                sourcePath = path('dist', platform, 'Electron.app', 'Contents', 'Resources', 'app', 'src');
            }
            copy('src', sourcePath).then(() => {
                if (platform === 'linux-x64') {
                    fs.chmodSync(path('dist', platform, 'electron'), 0o755);
                }
                fs.createReadStream(
                    path('package.json')
                ).pipe(fs.createWriteStream(
                    path.path.join(sourcePath, '..', 'package.json')
                ));
                console.log(`${platform} built`);
            });
        });
}

const fetchNext = i => {
    if (i >= config.build.platforms.length) {
        return;
    }

    const platform = config.build.platforms[i++];
    const archive = `electron-${version}-${platform}.zip`;
    const zipPath = path('cache', archive);

    if (fs.existsSync(zipPath)) {
        process(platform, zipPath);
        return fetchNext(i);
    }

    console.log(`Downloading binaries for the ${platform} target in ${zipPath}`);
    return fetch(`${baseUrl}/${archive}`, response => {
        const file = fs.createWriteStream(zipPath);
        response.on('end', () => {
            process(platform, zipPath);
            fetchNext(i);
        });
        response.pipe(file);
    });
};
fetchNext(0);
