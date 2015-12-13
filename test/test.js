var mock = require('mock-fs'),
    path = require('path'),
    expect = require('chai').expect,
    config = require('..'),
    localConfigName = config.getConfigFilename(),
    globalConfigName = config.getConfigFilename(true),
    findConfigPath = require.resolve('find-config'),
    osHomedirPath = require.resolve('os-homedir'),
    tilde = require(osHomedirPath)(),
    globalConfigPath = path.resolve(tilde, globalConfigName),
    localConfigPath = path.resolve(process.cwd(), localConfigName),
    localDirName = path.dirname(localConfigPath);

    require(findConfigPath);

describe('bem-config tests', function() {

    afterEach(function () {
        mock.restore();
    });

    it('should return local config filename', function() {
        expect('bemconf.json').eql(config.getConfigFilename());
    });

    it('should return global config filename', function() {
        expect('.bemconf.json').eql(config.getConfigFilename(true));
    });

    it('should return global config path', function() {
        expect(path.resolve(tilde, '.bemconf.json')).eql(config.getGlobalConfigPath());
    });

    it('should return empty configs', function() {
        mock({});

        expect({
            global: {},
            local: {},
            extended: {}
        }).eql(config());
    });

    it('should return global config', function() {
        var scheme = {};
        scheme[globalConfigPath] = '{ "GLOBAL": "1" }';
        mock(scheme);

        expect({
            global: { GLOBAL: '1' },
            local: {},
            extended: { GLOBAL: '1' }
        }).eql(config());
    });

    it('should respect local config', function() {
        var scheme = {};

        scheme[localConfigPath] = '{ "GLOBAL": "1" }';
        scheme[localConfigPath] = '{ "LOCAL": "1", "root": true }';

        mock(scheme);
        expect({
            global: { GLOBAL: '1' },
            local: { LOCAL: '1', root: localDirName },
            extended: { GLOBAL: '1', LOCAL: '1', root: localDirName }
        }).eql(config());
    });

    it('should override config with option argument', function() {
        var scheme = {};
        scheme[globalConfigPath] = '{ "GLOBAL": "1" }';
        scheme[localConfigPath] = '{ "LOCAL": "1", "root": true }';
        mock(scheme);

        expect({
            global: { GLOBAL: '1' },
            local: { LOCAL: '1', root: localDirName },
            extended: { GLOBAL: '1', LOCAL: '1', OPTION: '1', root: localDirName }
        }).eql(config({ OPTION: '1'}));
    });

    // TODO: fix moch-fs
    it('should find config a level directory up', function() {
        var scheme = {},
            newLocalDirName = path.dirname(path.resolve('..', localConfigName));
        scheme[globalConfigPath] = '{ "GLOBAL": "1" }';
        scheme[localConfigPath] = ''; // delete config in cwd
        scheme[path.resolve('..', localConfigName)] = '{ "LOCAL": "1", "root": true }';
        mock(scheme);

        expect({
            global: { GLOBAL: '1' },
            local: { LOCAL: '1', root: newLocalDirName },
            extended: { GLOBAL: '1', LOCAL: '1', OPTION: '1', root: newLocalDirName }
        }).eql(config({ OPTION: '1'}));
    });
});
