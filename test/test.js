var mock = require('mock-fs'),
    config = require('..'),
    path = require('path'),
    expect = require('chai').expect,
    tilde = require('os-homedir')(),
    clearRequire = require('clear-require');

describe('bem-config tests', function() {
    var localConfigName,
        globalConfigName,
        globalConfigPath,
        localConfigPath,
        localDirName,
        newlocalConfigPath,
        newlocalDirName;

    beforeEach(function() {
        localConfigName = config.getConfigFilename();
        localConfigPath = path.resolve(process.cwd(), localConfigName);
        localDirName = path.dirname(localConfigPath);
        globalConfigName = config.getConfigFilename(true);
        globalConfigPath = path.resolve(tilde, globalConfigName);
        newlocalConfigPath = path.resolve('..', localConfigName);
        newlocalDirName = path.dirname(path.resolve('..', localConfigName));
    });

    afterEach(function() {
        try { clearRequire(globalConfigPath)} catch (e) {};
        try { clearRequire(localConfigPath)} catch (e) {};
        try { clearRequire(newlocalConfigPath)} catch (e) {};
        try { clearRequire(newlocalDirName)} catch (e) {};
        mock.restore();
    });

    it('should return local config filename', function() {
        expect(config.getConfigFilename()).eql('bemconf.json');
    });

    it('should return global config filename', function() {
        expect(config.getConfigFilename(true)).eql('.bemconf.json');
    });

    it('should return global config path', function() {
        expect(config.getGlobalConfigPath()).eql(path.resolve(tilde, '.bemconf.json'));
    });

    it('should return empty configs', function() {
        mock({});

        expect(config()).eql({
            global: {},
            local: {},
            extended: {}
        });
    });

    it('should return global config', function() {
        var scheme = {};
        scheme[globalConfigPath] = '{ "GLOBAL": "1" }';
        mock(scheme);

        expect(config()).eql({
            global: { GLOBAL: '1' },
            local: {},
            extended: { GLOBAL: '1' }
        });
    });

    it('should respect local config', function() {
        var scheme = {};

        scheme[globalConfigPath] = '{ "GLOBAL": "2" }';
        scheme[localConfigPath] = '{ "LOCAL": "1", "root": true }';

        mock(scheme);
        expect(config()).eql({
            global: { GLOBAL: '2' },
            local: { LOCAL: '1', root: localDirName },
            extended: { GLOBAL: '2', LOCAL: '1', root: localDirName }
        });
    });

    it('should override config with option argument', function() {
        var scheme = {};
        scheme[globalConfigPath] = '{ "GLOBAL": "1" }';
        scheme[localConfigPath] = '{ "LOCAL": "1", "root": true }';
        mock(scheme);

        expect(config({ OPTION: '1'})).eql({
            global: { GLOBAL: '1' },
            local: { LOCAL: '1', root: localDirName },
            extended: { GLOBAL: '1', LOCAL: '1', OPTION: '1', root: localDirName }
        });
    });

    it('should find config a level directory up', function() {
        var scheme = {};
        scheme[globalConfigPath] = '{ "GLOBAL": "1" }';
        scheme[newlocalConfigPath] = '{ "LOCAL": "2", "root": true }';
        mock(scheme);

        expect(config({ OPTION: '1'})).eql({
            global: { GLOBAL: '1' },
            local: { LOCAL: '2', root: newlocalDirName },
            extended: { GLOBAL: '1', LOCAL: '2', OPTION: '1', root: newlocalDirName }
        });
    });
});
