Object.assign || (Object.assign = require('object-assign'));

var fs = require('fs'),
    path = require('path'),
    tilde = require('os-homedir')(),
    findConfig = require('find-config');

/**
 * @param {boolean} isGlobal
 */
function getConfigFilename(isGlobal) {
    return (isGlobal ? '.' : '') + 'bemconf.json';
}

function getGlobalConfigPath() {
    return path.resolve(tilde, getConfigFilename(true));
}

function writeGlobalConfig(data) {
    fs.writeFileSync(getGlobalConfigPath(), JSON.stringify(data, null, 2));
}

module.exports = function(config) {
    var localConfig = {},
        cwd = process.cwd();

    do {
        var possibleConfig;
        try {
            possibleConfig = findConfig.require(getConfigFilename(), { cwd: cwd, home: false });
        } catch(e) {}

        Object.assign(localConfig, possibleConfig);

        if (localConfig.root) localConfig.root = cwd;

        cwd = path.resolve(cwd, '..');

    } while(!localConfig.root && cwd !== '/');

    var globalConfig = {};
    try {
        globalConfig = require(path.join(tilde, getConfigFilename(true)));
    } catch(e) {}

    var extendedConfig = Object.assign({}, globalConfig, localConfig, config);

    return {
        global: globalConfig,
        local: localConfig,
        extended: extendedConfig
    };
};

module.exports.getConfigFilename = getConfigFilename;
module.exports.getGlobalConfigPath = getGlobalConfigPath;
module.exports.writeGlobalConfig = writeGlobalConfig;
